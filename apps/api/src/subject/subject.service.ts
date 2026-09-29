import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectQueryDto } from './dto';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // ── CRUD Operations ────────────────────────────────────────

  /**
   * Create a new subject within a specific branch.
   */
  async create(dto: CreateSubjectDto) {
    const trimmedName = dto.name.trim();

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID '${dto.branchId}' not found`);
    }

    // Check unique constraint (name + branchId)
    const existing = await this.prisma.subject.findUnique({
      where: {
        name_branchId: {
          name: trimmedName,
          branchId: dto.branchId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `A subject with the name '${trimmedName}' already exists in this branch`,
      );
    }

    return this.prisma.subject.create({
      data: {
        name: trimmedName,
        branchId: dto.branchId,
      },
      include: {
        branch: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Retrieve all subjects with optional filtering by branch and search keyword.
   */
  async findAll(query?: SubjectQueryDto) {
    const where: Prisma.SubjectWhereInput = {};

    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    if (query?.search) {
      const search = query.search.trim();
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        branch: { select: { id: true, name: true } },
        _count: {
          select: {
            teachers: true,
            examFiles: true,
            examBankQuestions: true,
          },
        },
      },
    });
  }

  /**
   * Alias for findAll, optionally filtering by branch ID.
   */
  async getAll(branchId?: string) {
    return this.findAll({ branchId });
  }

  /**
   * Find a single subject by ID, including its branch, teachers, and related entity counts.
   */
  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        teachers: {
          select: {
            id: true,
            name: true,
            title: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            teachers: true,
            examFiles: true,
            examBankQuestions: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID '${id}' not found`);
    }

    return subject;
  }

  /**
   * Alias for findOne by ID.
   */
  async getById(id: string) {
    return this.findOne(id);
  }

  /**
   * Update an existing subject's name and/or branch.
   */
  async update(id: string, dto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID '${id}' not found`);
    }

    // If changing branch, verify that the new branch exists
    if (dto.branchId && dto.branchId !== subject.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID '${dto.branchId}' not found`);
      }
    }

    const targetName =
      dto.name !== undefined ? dto.name.trim() : subject.name;
    const targetBranchId =
      dto.branchId !== undefined ? dto.branchId : subject.branchId;

    // Check unique constraint if name or branch changed
    if (targetName !== subject.name || targetBranchId !== subject.branchId) {
      const existing = await this.prisma.subject.findUnique({
        where: {
          name_branchId: {
            name: targetName,
            branchId: targetBranchId,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `A subject with the name '${targetName}' already exists in this branch`,
        );
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? targetName : undefined,
        branchId: dto.branchId !== undefined ? dto.branchId : undefined,
      },
      include: {
        branch: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Delete a subject by ID and clean up any associated book PDF from storage.
   */
  async remove(id: string): Promise<{ message: string }> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID '${id}' not found`);
    }

    // Clean up uploaded book PDF if one exists
    if (subject.bookPdfKey) {
      try {
        await this.storage.deleteFile(subject.bookPdfKey);
        this.logger.log(
          `Deleted book PDF for subject ${id}: ${subject.bookPdfKey}`,
        );
      } catch (err) {
        this.logger.warn(
          `Failed to delete book PDF ${subject.bookPdfKey} on subject removal`,
          err,
        );
      }
    }

    try {
      await this.prisma.subject.delete({ where: { id } });
      return { message: `Subject '${subject.name}' deleted successfully` };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Cannot delete subject because it has related data (exams, questions, or teachers)',
        );
      }
      throw error;
    }
  }

  /**
   * Alias for remove.
   */
  async delete(id: string) {
    return this.remove(id);
  }

  // ── Branch & User Queries ──────────────────────────────────

  async getByBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.subject.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
    });
  }

  async getByUserBranch(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { branchId: true },
    });

    if (!user || !user.branchId) {
      throw new NotFoundException('User has no branch selected');
    }

    return this.prisma.subject.findMany({
      where: { branchId: user.branchId },
      orderBy: { name: 'asc' },
    });
  }

  // ── Book PDF Management ────────────────────────────────────

  /**
   * Upload (or replace) the PDF book for a subject.
   * Stores the file under `books/{subjectId}/{originalName}` in S3.
   */
  async uploadBookPdf(subjectId: string, file: Express.Multer.File) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Delete old book from S3 if one already exists
    if (subject.bookPdfKey) {
      try {
        await this.storage.deleteFile(subject.bookPdfKey);
        this.logger.log(`Deleted old book PDF: ${subject.bookPdfKey}`);
      } catch (err) {
        this.logger.warn(`Failed to delete old book PDF: ${subject.bookPdfKey}`, err);
      }
    }

    // Sanitize key to avoid spaces and special characters that break S3/MinIO SigV4 URLs
    const s3Key = `books/${subjectId}/book.pdf`;
    await this.storage.uploadFile(s3Key, file.buffer, file.mimetype || 'application/pdf');

    const updated = await this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        bookPdfKey: s3Key,
        bookPdfOriginalName: file.originalname,
        bookPdfSize: file.size,
      },
    });

    this.logger.log(`Uploaded book PDF for subject ${subjectId}: ${s3Key}`);

    return {
      message: 'Book PDF uploaded successfully',
      subject: {
        id: updated.id,
        name: updated.name,
        bookPdfOriginalName: updated.bookPdfOriginalName,
        bookPdfSize: updated.bookPdfSize,
      },
    };
  }

  /**
   * Generate a presigned S3 URL for downloading the book PDF.
   * Forces browser download with the original filename.
   */
  async getBookDownloadUrl(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!subject.bookPdfKey) {
      throw new NotFoundException('No book PDF has been uploaded for this subject');
    }

    const url = await this.storage.getPresignedUrl(
      subject.bookPdfKey,
      subject.bookPdfOriginalName,
    );

    return {
      downloadUrl: url,
      originalName: subject.bookPdfOriginalName,
      fileSize: subject.bookPdfSize,
    };
  }

  /**
   * Get the book file buffer directly from storage (for proxy streaming).
   */
  async getBookFile(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!subject.bookPdfKey) {
      throw new NotFoundException('No book PDF has been uploaded for this subject');
    }

    const buffer = await this.storage.getFileBuffer(subject.bookPdfKey);
    return {
      buffer,
      originalName: subject.bookPdfOriginalName ?? 'book.pdf',
      fileSize: subject.bookPdfSize ?? buffer.length,
    };
  }

  /**
   * Remove the book PDF from a subject (admin action).
   */
  async deleteBookPdf(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!subject.bookPdfKey) {
      throw new NotFoundException('No book PDF to delete for this subject');
    }

    await this.storage.deleteFile(subject.bookPdfKey);

    await this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        bookPdfKey: null,
        bookPdfOriginalName: null,
        bookPdfSize: null,
      },
    });

    this.logger.log(`Deleted book PDF for subject ${subjectId}`);

    return { message: 'Book PDF deleted successfully' };
  }
}
