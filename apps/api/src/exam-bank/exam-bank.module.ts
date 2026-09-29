import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES_ENABLED } from '../common/queues';

// Controllers
import { ExamBankController } from './controllers/exam-bank.controller';
import { StagingController } from './controllers/staging.controller';

// Services
import { ExamBankService } from './services/exam-bank.service';
import { StagingService } from './services/staging.service';
import { HybridSearchService } from './services/hybrid-search.service';

// Processors (BullMQ workers)
import { ExtractionProcessor } from './processors/extraction.processor';
import { EmbeddingProcessor } from './processors/embedding.processor';

// Event listeners
import { EmbeddingListener } from './listeners/embedding.listener';

// Infrastructure modules
import { StorageModule } from '../storage/storage.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    StorageModule,
    GeminiModule,
    // بدون Redis ما منسجّل الطوابير ولا الـ workers — وإلا بيضلوا
    // يحاولوا الاتصال ويغرقوا الـ log وقت الإقلاع
    ...(QUEUES_ENABLED
      ? [
          BullModule.registerQueue(
            { name: 'exam-extraction' },
            { name: 'question-embedding' },
          ),
        ]
      : []),
  ],
  controllers: [ExamBankController, StagingController],
  providers: [
    ExamBankService,
    StagingService,
    HybridSearchService,
    EmbeddingListener,
    ...(QUEUES_ENABLED ? [ExtractionProcessor, EmbeddingProcessor] : []),
  ],
})
export class ExamBankModule {}
