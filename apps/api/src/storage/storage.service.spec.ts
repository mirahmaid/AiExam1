import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({
        Body: (async function* () {
          yield Buffer.from('mock pdf content');
        })(),
      }),
    })),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/lib-storage', () => {
  return {
    Upload: jest.fn().mockImplementation(() => ({
      done: jest.fn().mockResolvedValue({}),
    })),
  };
});

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const map: Record<string, any> = {
                AWS_REGION: 'us-east-1',
                AWS_ACCESS_KEY_ID: 'test-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret',
                AWS_S3_BUCKET_NAME: 'test-bucket',
                AWS_S3_ENDPOINT: '',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload a file and return the key', async () => {
    const buffer = Buffer.from('test file data');
    const result = await service.uploadFile('test-key.pdf', buffer, 'application/pdf');
    expect(result).toBe('test-key.pdf');
  });

  it('should download a file and return a buffer', async () => {
    const buffer = await service.getFileBuffer('test-key.pdf');
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toBe('mock pdf content');
  });

  it('should delete a file', async () => {
    await expect(service.deleteFile('test-key.pdf')).resolves.not.toThrow();
  });

  it('should initialize S3Client with custom endpoint and forcePathStyle: true for S3-compatible storage like Backblaze', async () => {
    const { S3Client } = jest.requireMock('@aws-sdk/client-s3');
    const customConfig = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          AWS_REGION: 'us-east-005',
          AWS_ACCESS_KEY_ID: 'b2-key-id',
          AWS_SECRET_ACCESS_KEY: 'b2-app-key',
          AWS_S3_BUCKET_NAME: 'ai-exam-bank-storage123',
          AWS_S3_ENDPOINT: 'https://s3.us-east-005.backblazeb2.com',
        };
        return map[key];
      }),
    };

    const customService = new StorageService(customConfig as any);
    customService.onModuleInit();

    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        region: 'us-east-005',
        endpoint: 'https://s3.us-east-005.backblazeb2.com',
        forcePathStyle: true,
        credentials: {
          accessKeyId: 'b2-key-id',
          secretAccessKey: 'b2-app-key',
        },
      }),
    );
  });
});
