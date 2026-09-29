import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { GeminiService } from '../../gemini/gemini.service';

interface ExtractionJobData {
  examFileId: string;
}

/**
 * BullMQ worker that processes PDF extraction jobs.
 *
 * Flow:
 * 1. Update exam file status → PROCESSING
 * 2. Download PDF buffer from S3
 * 3. Send to Gemini for multimodal structured extraction
 * 4. Idempotent transaction: purge old drafts + insert new staged questions
 * 5. Update exam file status → COMPLETED
 *
 * On failure: status → FAILED with error log.
 */
@Processor('exam-extraction')
export class ExtractionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExtractionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly gemini: GeminiService,
  ) {
    super();
  }

  async process(job: Job<ExtractionJobData>): Promise<void> {
    const { examFileId } = job.data;
    this.logger.log(
      `Processing extraction job for examFile ${examFileId} (attempt ${job.attemptsMade + 1})`,
    );

    try {
      // 1. Mark as PROCESSING
      const examFile = await this.prisma.examFile.update({
        where: { id: examFileId },
        data: { status: 'PROCESSING' },
      });

      // 2. Download file from S3
      const fileBuffer = await this.storage.getFileBuffer(examFile.s3Key);
      this.logger.log(
        `Downloaded ${examFile.s3Key} (${fileBuffer.length} bytes)`,
      );

      // 3. Extract questions via Gemini multimodal
      const questions = await this.gemini.extractQuestionsFromFile(
        fileBuffer,
        examFile.mimeType,
      );
      this.logger.log(
        `Gemini extracted ${questions.length} questions from ${examFile.originalName}`,
      );

      // 4. Idempotent transaction: purge old drafts + insert new ones
      await this.prisma.$transaction(async (tx) => {
        // Purge any existing drafts for this examFileId (idempotency on retry)
        await tx.stagedQuestion.deleteMany({
          where: { examFileId },
        });

        // Insert extracted questions
        if (questions.length > 0) {
          await tx.stagedQuestion.createMany({
            data: questions.map((q) => ({
              examFileId,
              questionText: q.questionText,
              choices: q.choices,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation ?? null,
            })),
          });
        }

        // 5. Mark as COMPLETED
        await tx.examFile.update({
          where: { id: examFileId },
          data: { status: 'COMPLETED', errorLog: null },
        });
      });

      this.logger.log(
        `Extraction complete for examFile ${examFileId}: ${questions.length} questions staged`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.stack ?? error.message : String(error);

      this.logger.error(
        `Extraction failed for examFile ${examFileId}: ${errorMessage}`,
      );

      // Mark as FAILED with error log
      await this.prisma.examFile
        .update({
          where: { id: examFileId },
          data: { status: 'FAILED', errorLog: errorMessage },
        })
        .catch((updateErr) =>
          this.logger.error(
            `Failed to update examFile status: ${updateErr.message}`,
          ),
        );

      throw error; // Re-throw so BullMQ retries
    }
  }
}
