import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuestionGenerationService } from './question-generation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from '../../gemini/gemini.service';
import { GenerationPromptBuilder } from '../builders/generation-prompt.builder';
import { DifficultyLevel, BloomTaxonomyLevel } from '@prisma/client';

const mockPrisma = {
  subject: {
    findUnique: jest.fn(),
  },
  examBankQuestion: {
    findMany: jest.fn(),
  },
  generatedQuestion: {
    create: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
};

const mockGemini = {
  generateEmbedding: jest.fn(),
  generateQuestions: jest.fn(),
};

const mockPromptBuilder = {
  buildBankRagPrompt: jest.fn(),
};

describe('QuestionGenerationService', () => {
  let service: QuestionGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionGenerationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GeminiService, useValue: mockGemini },
        { provide: GenerationPromptBuilder, useValue: mockPromptBuilder },
      ],
    }).compile();

    service = module.get<QuestionGenerationService>(QuestionGenerationService);
    jest.clearAllMocks();
  });

  describe('generateFromBank', () => {
    const dto = {
      subjectId: 'sub-1',
      topicId: 'algebra',
      difficulty: DifficultyLevel.MEDIUM,
      bloomTaxonomy: BloomTaxonomyLevel.APPLY,
      count: 2,
    };

    it('should throw NotFoundException if subject does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFromBank('student-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if zero reference questions are found in the exam bank', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'sub-1',
        name: 'Mathematics',
        branch: { name: 'Scientific' },
      });
      mockGemini.generateEmbedding.mockResolvedValue([]);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ exists: false }]);
      mockPrisma.examBankQuestion.findMany.mockResolvedValue([]); // zero anchors

      await expect(
        service.generateFromBank('student-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate and persist questions via happy path', async () => {
      // Setup mocks
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 'sub-1', name: 'Math' });
      mockGemini.generateEmbedding.mockResolvedValue(new Array(768).fill(0.1));

      // pgvector query falls back to Prisma (stub $queryRawUnsafe to throw)
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('pgvector not available'));
      mockPrisma.examBankQuestion.findMany.mockResolvedValue([
        {
          id: 'bq-1',
          questionText: 'What is 2+2?',
          choices: [
            { label: 'A', text: '3' },
            { label: 'B', text: '4' },
            { label: 'C', text: '5' },
            { label: 'D', text: '6' },
          ],
          correctAnswer: 'B',
          explanation: 'Basic addition',
          bloomTaxonomy: 'REMEMBER',
          difficulty: 'EASY',
          embedding: [0.1],
        },
      ]);

      mockPromptBuilder.buildBankRagPrompt.mockReturnValue('Generated prompt');
      mockGemini.generateQuestions.mockResolvedValue([
        {
          questionText: 'What is 3+3?',
          choices: [
            { label: 'A', text: '5' },
            { label: 'B', text: '6' },
            { label: 'C', text: '7' },
            { label: 'D', text: '8' },
          ],
          correctAnswer: 'B',
          explanation: 'Addition',
          bloomTaxonomy: 'APPLY',
        },
      ]);

      const createdQuestion = {
        id: 'gen-1',
        questionText: 'What is 3+3?',
        choices: [
          { label: 'A', text: '5' },
          { label: 'B', text: '6' },
          { label: 'C', text: '7' },
          { label: 'D', text: '8' },
        ],
        correctAnswer: 'B',
        explanation: 'Addition',
        bloomTaxonomy: 'APPLY',
        difficulty: 'MEDIUM',
        sourceType: 'BANK_RAG',
        referenceMetadata: { bankQuestionIds: ['bq-1'] },
        subjectId: 'sub-1',
        topicId: 'algebra',
        createdAt: new Date(),
      };
      mockPrisma.generatedQuestion.create.mockResolvedValue(createdQuestion);

      const result = await service.generateFromBank('student-1', dto);

      expect(result).toHaveLength(1);
      expect(mockGemini.generateEmbedding).toHaveBeenCalledTimes(1);
      expect(mockGemini.generateQuestions).toHaveBeenCalledWith(
        'Generated prompt',
        2,
      );
      expect(mockPrisma.generatedQuestion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studentId: 'student-1',
            subjectId: 'sub-1',
            sourceType: 'BANK_RAG',
          }),
        }),
      );
    });

    it('should use pgvector retrieval when embedding succeeds', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 'sub-1' });
      mockGemini.generateEmbedding.mockResolvedValue(new Array(768).fill(0.2));

      const pgRow = {
        id: 'bq-2',
        questionText: 'Complex question',
        choices: [
          { label: 'A', text: 'Option A' },
          { label: 'B', text: 'Option B' },
          { label: 'C', text: 'Option C' },
          { label: 'D', text: 'Option D' },
        ],
        correctAnswer: 'A',
        explanation: 'Explanation',
        bloomTaxonomy: 'APPLY',
        difficulty: 'MEDIUM',
      };
      mockPrisma.$queryRawUnsafe.mockImplementation(async (sql: string) => {
        if (sql.includes('pg_type')) return [{ exists: true }];
        return [pgRow];
      });
      mockPromptBuilder.buildBankRagPrompt.mockReturnValue('prompt');
      mockGemini.generateQuestions.mockResolvedValue([
        {
          questionText: 'Q?',
          choices: [
            { label: 'A', text: 'a' },
            { label: 'B', text: 'b' },
            { label: 'C', text: 'c' },
            { label: 'D', text: 'd' },
          ],
          correctAnswer: 'A',
          explanation: 'e',
          bloomTaxonomy: 'APPLY',
        },
      ]);
      mockPrisma.generatedQuestion.create.mockResolvedValue({ id: 'gen-2' });

      await service.generateFromBank('student-1', { ...dto, count: 1 });

      // pgvector query should have been called
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalled();
      // Fallback Prisma findMany should NOT be called since pgvector succeeded
      expect(mockPrisma.examBankQuestion.findMany).not.toHaveBeenCalled();
    });

    it('should propagate BadGatewayException when Gemini exhausts retries', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 'sub-1' });
      mockGemini.generateEmbedding.mockResolvedValue([]);
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('no pgvector'));
      mockPrisma.examBankQuestion.findMany.mockResolvedValue([
        {
          id: 'bq-1',
          questionText: 'Sample Q',
          choices: [{ label: 'A', text: '1' }],
          correctAnswer: 'A',
          explanation: null,
          bloomTaxonomy: 'APPLY',
          difficulty: 'MEDIUM',
          embedding: [],
        },
      ]);
      mockPromptBuilder.buildBankRagPrompt.mockReturnValue('prompt');

      const { BadGatewayException } = await import('@nestjs/common');
      mockGemini.generateQuestions.mockRejectedValue(
        new BadGatewayException('AI failed after retries'),
      );

      await expect(
        service.generateFromBank('student-1', dto),
      ).rejects.toThrow(BadGatewayException);
    });
  });
});
