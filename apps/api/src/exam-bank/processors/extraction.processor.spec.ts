import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionProcessor } from './extraction.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { GeminiService } from '../../gemini/gemini.service';

describe('ExtractionProcessor', () => {
  let processor: ExtractionProcessor;
  let prisma: any;
  let storage: any;
  let gemini: any;

  beforeEach(async () => {
    prisma = {
      examFile: {
        update: jest.fn().mockResolvedValue({
          id: 'file-1',
          s3Key: 'exam-files/123-test.pdf',
          originalName: 'test.pdf',
          mimeType: 'application/pdf',
        }),
      },
      stagedQuestion: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      $transaction: jest.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prisma);
        }
        return Promise.all(cb);
      }),
    };

    storage = {
      getFileBuffer: jest.fn().mockResolvedValue(Buffer.from('mock pdf content')),
    };

    gemini = {
      extractQuestionsFromFile: jest.fn().mockResolvedValue([
        {
          questionText: 'Question 1 with $x^2$',
          choices: [{ label: 'A', text: '1' }],
          correctAnswer: 'A',
          explanation: 'Proof',
        },
      ]),
      extractQuestionsFromPdf: jest.fn().mockResolvedValue([
        {
          questionText: 'Question 1 with $x^2$',
          choices: [{ label: 'A', text: '1' }],
          correctAnswer: 'A',
          explanation: 'Proof',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtractionProcessor,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: GeminiService, useValue: gemini },
      ],
    }).compile();

    processor = module.get<ExtractionProcessor>(ExtractionProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should download PDF, extract questions, and write staged questions idempotently', async () => {
    const mockJob = {
      data: { examFileId: 'file-1' },
      attemptsMade: 0,
    } as any;

    await processor.process(mockJob);

    expect(prisma.examFile.update).toHaveBeenCalledWith({
      where: { id: 'file-1' },
      data: { status: 'PROCESSING' },
    });
    expect(storage.getFileBuffer).toHaveBeenCalledWith('exam-files/123-test.pdf');
    expect(gemini.extractQuestionsFromFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      'application/pdf',
    );
    // Idempotent purge before insert
    expect(prisma.stagedQuestion.deleteMany).toHaveBeenCalledWith({
      where: { examFileId: 'file-1' },
    });
    expect(prisma.stagedQuestion.createMany).toHaveBeenCalled();
  });
});
