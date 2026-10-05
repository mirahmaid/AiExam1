import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import type { StorageDriver } from './storage-driver.interface';

/**
 * تخزين على S3 أو أي خدمة متوافقة معه (MinIO، Backblaze B2، Cloudflare R2).
 * نفس السلوك السابق بالضبط — بس صار خلف واجهة StorageDriver.
 */
@Injectable()
export class S3StorageDriver implements StorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  /** MinIO/R2 محلي (endpoint مخصص) — مش AWS */
  private readonly selfHosted: boolean;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    const endpoint = this.config.get<string>('AWS_S3_ENDPOINT');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET_NAME') || '';
    this.selfHosted = Boolean(endpoint);

    const s3Config: ConstructorParameters<typeof S3Client>[0] = {
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    };
    if (endpoint) {
      s3Config.endpoint = endpoint;
      s3Config.forcePathStyle = true;
    }

    this.s3 = new S3Client(s3Config);
    this.logger.log(
      `S3 storage (bucket: ${this.bucket}, endpoint: ${endpoint || 'AWS default'})`,
    );
  }

  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      return await this.put(key, body, contentType);
    } catch (err) {
      if ((err as { name?: string })?.name !== 'NoSuchBucket') throw err;
      // MinIO بـ docker-compose بيقوم فاضي وما حدا بيعمل الـ bucket، فكل
      // رفع كان يرجع 500. على MinIO منعمله أول مرة؛ على AWS الـ bucket
      // قرار بنية تحتية (صلاحيات، منطقة) فمنرمي خطأ واضح بدل ما ننشئه.
      if (!this.selfHosted) {
        throw new Error(
          `S3 bucket "${this.bucket}" does not exist — create it or fix AWS_S3_BUCKET_NAME`,
        );
      }
      await this.s3
        .send(new CreateBucketCommand({ Bucket: this.bucket }))
        .catch((e: { name?: string }) => {
          // نسخة تانية من السيرفر سبقتنا — مش مشكلة
          if (e?.name !== 'BucketAlreadyOwnedByYou') throw e;
        });
      this.logger.warn(`Created missing bucket "${this.bucket}"`);
      return this.put(key, body, contentType);
    }
  }

  private async put(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
      queueSize: 4,
      leavePartsOnError: false,
    });
    await upload.done();
    this.logger.log(`Uploaded ${key} (${body.length} bytes)`);
    return key;
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async getPresignedUrl(
    key: string,
    originalName?: string | null,
    expiresIn = 3600,
  ): Promise<string> {
    const filename = originalName
      ? encodeURIComponent(originalName)
      : 'book.pdf';

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentType: 'application/pdf',
      ResponseContentDisposition: `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Deleted ${key}`);
  }
}
