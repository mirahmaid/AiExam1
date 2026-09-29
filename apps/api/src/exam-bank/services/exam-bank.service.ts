import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUES_DISABLED_MESSAGE } from '../../common/queues';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { UploadExamDto } from '../dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionUpdatedEvent } from '../events/question-updated.event';

import { resolveExamMimeType, SUPPORTED_EXAM_MIME_TYPES } from '../../common';

export const ALLOWED_EXAM_MIME_TYPES = SUPPORTED_EXAM_MIME_TYPES;

@Injectable()
export class ExamBankService {
  private readonly logger = new Logger(ExamBankService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly eventEmitter: EventEmitter2,
    // اختياري: الطابور مش مسجّل لما ما يكون في REDIS_URL
    @Optional()
    @InjectQueue('exam-extraction')
    private readonly extractionQueue?: Queue,
  ) {}

  /**
   * Upload a PDF or image exam file to S3, create a database record, and enqueue
   * a lightweight extraction job containing only the record ID.
   */
  async uploadAndEnqueue(
    file: Express.Multer.File,
    dto: UploadExamDto,
    userId: string,
  ) {
    // Fail before touching storage or the database: a 503 raised after the
    // upload would leave a stray file and an orphan ExamFile row behind.
    const extractionQueue = this.extractionQueue;
    if (!extractionQueue) {
      throw new ServiceUnavailableException(QUEUES_DISABLED_MESSAGE);
    }

    // Validate & normalize MIME type (checks headers, filename extension, and magic bytes)
    const resolvedMime = resolveExamMimeType(file);
    if (!resolvedMime) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${ALLOWED_EXAM_MIME_TYPES.join(', ')}`,
      );
    }

    // Validate file size (50 MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50 MB limit');
    }

    // Validate branch & subject existence
    const [branch, subject] = await Promise.all([
      this.prisma.branch.findUnique({ where: { id: dto.branchId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
    ]);
    if (!branch) throw new NotFoundException('Branch not found');
    if (!subject) throw new NotFoundException('Subject not found');

    // Generate unique S3 key
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `exam-files/${timestamp}-${safeName}`;

    // Upload to S3
    await this.storage.uploadFile(s3Key, file.buffer, file.mimetype);

    // Create database record
    const examFile = await this.prisma.examFile.create({
      data: {
        originalName: file.originalname,
        s3Key,
        mimeType: file.mimetype,
        fileSize: file.size,
        branchId: dto.branchId,
        subjectId: dto.subjectId,
        year: dto.year,
        term: dto.term,
        uploadedBy: userId,
      },
    });

    // Enqueue lightweight job (ID only — no PDF data in Redis)
    await extractionQueue.add(
      'extract',
      { examFileId: examFile.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );

    this.logger.log(
      `Enqueued extraction job for examFile ${examFile.id} (${file.originalname})`,
    );

    return { examFileId: examFile.id, status: examFile.status };
  }

  /**
   * Get a single exam file by ID with its staged questions.
   */
  async getExamFile(id: string) {
    const examFile = await this.prisma.examFile.findUnique({
      where: { id },
      include: { stagedQuestions: true, branch: true, subject: true },
    });
    if (!examFile) throw new NotFoundException('Exam file not found');
    return examFile;
  }

  /**
   * List exam files with optional status filter and pagination.
   */
  async listExamFiles(
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.examFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { branch: true, subject: true },
      }),
      this.prisma.examFile.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Update a published exam bank question and emit QuestionUpdatedEvent
   * to trigger async re-indexing of the vector embedding.
   */
  async updateBankQuestion(
    id: string,
    dto: Record<string, unknown>,
  ) {
    const existing = await this.prisma.examBankQuestion.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Question not found');
    }

    // Track whether text content changed (requires re-embedding)
    const textChanged =
      ('questionText' in dto && dto.questionText !== existing.questionText) ||
      ('explanation' in dto && dto.explanation !== existing.explanation);

    const updated = await this.prisma.examBankQuestion.update({
      where: { id },
      data: {
        ...dto,
        // Reset embedding status if text changed
        ...(textChanged ? { embeddingStatus: 'PENDING' } : {}),
      },
    });

    if (textChanged) {
      this.eventEmitter.emit(
        'question.updated',
        new QuestionUpdatedEvent(id),
      );
      this.logger.log(
        `Emitted QuestionUpdatedEvent for question ${id} (text changed)`,
      );
    }

    return updated;
  }

  /**
   * Soft-delete a published exam bank question.
   * Sets deletedAt = now(), immediately excluding it from search queries.
   */
  async softDeleteBankQuestion(id: string) {
    const existing = await this.prisma.examBankQuestion.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.examBankQuestion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Question soft-deleted' };
  }

  /**
   * Get a single published exam bank question by ID.
   */
  async getBankQuestion(id: string) {
    const question = await this.prisma.examBankQuestion.findUnique({
      where: { id },
      include: { branch: true, subject: true },
    });
    if (!question || question.deletedAt) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }
}
