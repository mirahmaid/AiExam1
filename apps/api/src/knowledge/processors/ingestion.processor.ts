import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IngestionPipelineService } from '../services/ingestion-pipeline.service';
import {
  INGESTION_QUEUE,
  IngestionJobData,
  IngestionJobName,
} from '../knowledge.types';

/**
 * عامل طابور المعالجة. مهمة وحدة بالمرة (concurrency 1): التفريغ الضوئي
 * والتضمين بيستهلكوا حدود المزوّد، وملفين بالتوازي بيطيّحوا الاتنين.
 */
// القفل بيتجدد تلقائياً كل نص مدة وهو شغّال، فمهمة ساعة ما بتنقطع. المدة
// القصيرة بتخلّي مهمة انقطعت (السيرفر رجع قام) ترجع للطابور خلال دقيقتين
// وبتكمّل من نقطة الحفظ.
@Processor(INGESTION_QUEUE, { concurrency: 1, lockDuration: 2 * 60_000 })
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(private readonly pipeline: IngestionPipelineService) {
    super();
  }

  async process(
    job: Job<IngestionJobData, void, IngestionJobName>,
  ): Promise<void> {
    const { documentId } = job.data;
    this.logger.log(
      `${job.name} ${documentId} (attempt ${job.attemptsMade + 1})`,
    );
    switch (job.name) {
      case 'process':
        return this.pipeline.process(documentId);
      case 'rechunk':
        return this.pipeline.rechunk(documentId);
      case 'embed':
        return this.pipeline.embed(documentId);
    }
  }
}
