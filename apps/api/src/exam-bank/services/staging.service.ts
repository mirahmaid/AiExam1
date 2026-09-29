import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ApproveQuestionDto, UpdateStagedQuestionDto, QueryStagedDto } from '../dto';
import { QuestionApprovedEvent } from '../events/question-approved.event';

@Injectable()
export class StagingService {
  private readonly logger = new Logger(StagingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * List staged questions with filtering and pagination.
   */
  async list(query: QueryStagedDto) {
    const { examFileId, status, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {};
    if (examFileId) where.examFileId = examFileId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.stagedQuestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          examFile: {
            select: {
              originalName: true,
              branchId: true,
              subjectId: true,
              year: true,
              term: true,
            },
          },
        },
      }),
      this.prisma.stagedQuestion.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get a single staged question by ID.
   */
  async getById(id: string) {
    const question = await this.prisma.stagedQuestion.findUnique({
      where: { id },
      include: { examFile: true },
    });
    if (!question) throw new NotFoundException('Staged question not found');
    return question;
  }

  /**
   * Update a staged question draft (only while status is PENDING).
   */
  async update(id: string, dto: UpdateStagedQuestionDto) {
    const existing = await this.prisma.stagedQuestion.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Staged question not found');
    if (existing.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot edit a question with status "${existing.status}"`,
      );
    }

    return this.prisma.stagedQuestion.update({
      where: { id },
      data: {
        ...(dto.questionText !== undefined && {
          questionText: dto.questionText,
        }),
        ...(dto.choices !== undefined && {
          choices: dto.choices as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.correctAnswer !== undefined && {
          correctAnswer: dto.correctAnswer,
        }),
        ...(dto.explanation !== undefined && { explanation: dto.explanation }),
      },
    });
  }

  /**
   * Approve a staged question with pedagogical metadata.
   * Executes an atomic transaction that:
   * 1. Updates the staged question to APPROVED
   * 2. Creates a new ExamBankQuestion record
   * 3. Emits QuestionApprovedEvent for async embedding
   */
  async approve(id: string, dto: ApproveQuestionDto, reviewerId: string) {
    const staged = await this.prisma.stagedQuestion.findUnique({
      where: { id },
      include: { examFile: true },
    });
    if (!staged) throw new NotFoundException('Staged question not found');
    if (staged.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot approve a question with status "${staged.status}"`,
      );
    }

    const questionText = dto.correctedQuestionText ?? staged.questionText;

    const [, bankQuestion] = await this.prisma.$transaction([
      // 1. Mark staged question as approved
      this.prisma.stagedQuestion.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          ...(dto.correctedQuestionText && {
            questionText: dto.correctedQuestionText,
          }),
        },
      }),
      // 2. Create published exam bank question
      this.prisma.examBankQuestion.create({
        data: {
          questionText,
          choices: staged.choices as object,
          correctAnswer: staged.correctAnswer,
          explanation: staged.explanation,
          branchId: staged.examFile.branchId,
          subjectId: staged.examFile.subjectId,
          year: staged.examFile.year,
          term: staged.examFile.term,
          difficulty: dto.difficulty,
          bloomTaxonomy: dto.bloomTaxonomy,
          topicId: dto.topicId,
          sourceFileId: staged.examFileId,
        },
      }),
    ]);

    // 3. Emit domain event for async embedding (non-blocking)
    this.eventEmitter.emit(
      'question.approved',
      new QuestionApprovedEvent(bankQuestion.id),
    );

    this.logger.log(
      `Approved staged question ${id} → bank question ${bankQuestion.id}`,
    );

    return bankQuestion;
  }

  /**
   * Reject a staged question.
   */
  async reject(id: string, reviewerId: string) {
    const staged = await this.prisma.stagedQuestion.findUnique({
      where: { id },
    });
    if (!staged) throw new NotFoundException('Staged question not found');
    if (staged.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot reject a question with status "${staged.status}"`,
      );
    }

    return this.prisma.stagedQuestion.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });
  }
}
