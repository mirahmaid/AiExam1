import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './services/chat.service';
import { IntentClassifierService } from './services/intent-classifier.service';
import { ContentGuardrailService } from './services/content-guardrail.service';
import { ChatContextService } from './services/chat-context.service';
import { SessionOwnerGuard } from './guards/session-owner.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';
import { RedisModule } from '../redis/redis.module';
import { StorageModule } from '../storage/storage.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    PrismaModule,
    GeminiModule,
    RedisModule,
    StorageModule,
    QuestionsModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    IntentClassifierService,
    ContentGuardrailService,
    ChatContextService,
    SessionOwnerGuard,
  ],
})
export class ChatModule {}
