import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamBankService } from './exam-bank.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

describe('ExamBankService', () => {
  let service: ExamBankService;
  let prisma: any;
  let storage: any;
  let queue: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      branch: { findUnique: jest.fn() },
      subject: { findUnique: jest.fn() },
      examFile: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      examBankQuestion: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    storage = {
      uploadFile: jest.fn().mockResolvedValue('s3-key.pdf'),
    };

    queue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamBankService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: getQueueToken('exam-extraction'), useValue: queue },
      ],
    }).compile();

    service = module.get<ExamBankService>(ExamBankService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload PDF, create exam_file record, and enqueue job with ID only', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'calculus_2025.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: Buffer.from('pdf data'),
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-1' });
    prisma.subject.findUnique.mockResolvedValue({ id: 'subject-1' });
    prisma.examFile.create.mockResolvedValue({
      id: 'file-1',
      originalName: 'calculus_2025.pdf',
      status: 'PENDING',
    });

    const result = await service.uploadAndEnqueue(
      mockFile,
      { branchId: 'branch-1', subjectId: 'subject-1', year: 2025, term: 'First' },
      'admin-1',
    );

    expect(result.examFileId).toBe('file-1');
    expect(result.status).toBe('PENDING');
    expect(storage.uploadFile).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledWith(
      'extract',
      { examFileId: 'file-1' },
      expect.objectContaining({ attempts: 3 }),
    );
  });

  it('should accept and upload image files (e.g. image/png, image/jpeg)', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'exam_page_1.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('image data'),
      size: 2048,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-1' });
    prisma.subject.findUnique.mockResolvedValue({ id: 'subject-1' });
    prisma.examFile.create.mockResolvedValue({
      id: 'file-img-1',
      originalName: 'exam_page_1.png',
      mimeType: 'image/png',
      status: 'PENDING',
    });

    const result = await service.uploadAndEnqueue(
      mockFile,
      { branchId: 'branch-1', subjectId: 'subject-1', year: 2025, term: 'First' },
      'admin-1',
    );

    expect(result.examFileId).toBe('file-img-1');
    expect(result.status).toBe('PENDING');
    expect(storage.uploadFile).toHaveBeenCalledWith(
      expect.stringContaining('exam-files/'),
      mockFile.buffer,
      'image/png',
    );
  });

  it('should reject unsupported file types (e.g. zip, text)', async () => {
    const mockFile = {
      mimetype: 'application/zip',
      size: 1024,
    } as Express.Multer.File;

    await expect(
      service.uploadAndEnqueue(
        mockFile,
        { branchId: 'branch-1', subjectId: 'subject-1', year: 2025, term: 'First' },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should soft-delete an exam bank question', async () => {
    prisma.examBankQuestion.findUnique.mockResolvedValue({
      id: 'q-1',
      deletedAt: null,
    });
    prisma.examBankQuestion.update.mockResolvedValue({
      id: 'q-1',
      deletedAt: new Date(),
    });

    const result = await service.softDeleteBankQuestion('q-1');
    expect(result.message).toBe('Question soft-deleted');
    expect(prisma.examBankQuestion.update).toHaveBeenCalledWith({
      where: { id: 'q-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
