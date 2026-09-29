import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { STORAGE_DRIVER } from './drivers/storage-driver.interface';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { FilesController } from './files.controller';

/**
 * يختار محرّك التخزين حسب الإعدادات:
 * إذا في bucket ومفاتيح S3 → S3/MinIO، وإلا → قرص السيرفر.
 *
 * يعني افتراضياً (بدون إعدادات) المشروع بيشتغل بدون أي سيرفر تخزين.
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    LocalStorageDriver,
    {
      provide: STORAGE_DRIVER,
      inject: [ConfigService, LocalStorageDriver],
      useFactory: (config: ConfigService, local: LocalStorageDriver) => {
        const bucket = config.get<string>('AWS_S3_BUCKET_NAME');
        const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY');
        const useS3 = Boolean(bucket && accessKeyId && secretAccessKey);
        return useS3 ? new S3StorageDriver(config) : local;
      },
    },
    StorageService,
  ],
  exports: [StorageService, LocalStorageDriver],
})
export class StorageModule {}
