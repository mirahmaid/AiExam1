import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common';
import type { User } from '@prisma/client';
import { GenerationRateLimitGuard } from '../guards/generation-rate-limit.guard';
import { QuotaRefundInterceptor } from '../interceptors/quota-refund.interceptor';
import { QuestionGenerationService } from '../services/question-generation.service';
import { StyleUploadService } from '../services/style-upload.service';
import { StyleGenerationService } from '../services/style-generation.service';
import { GenerateQuestionsDto } from '../dto/generate-questions.dto';
import { GenerateFromStyleDto } from '../dto/generate-from-style.dto';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Questions')
@ApiBearerAuth('access-token')
// JwtAuthGuard مسجّل عالمياً كـ APP_GUARD بـ common.module.ts —
// تكراره هون كان بيخلّي JwtStrategy.validate تنفّذ مرتين لكل طلب.
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionGenerationService: QuestionGenerationService,
    private readonly styleUploadService: StyleUploadService,
    private readonly styleGenerationService: StyleGenerationService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // US-14: Bank RAG Generation
  // ─────────────────────────────────────────────────────────────────────────

  @Post('generate')
  @UseGuards(GenerationRateLimitGuard)
  @UseInterceptors(QuotaRefundInterceptor)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate AI questions via Hybrid RAG (US-14)',
    description:
      'Generates new practice questions using pgvector semantic retrieval from the exam bank and Google Gemini 2.5 Flash with structured JSON output and self-healing retry.',
  })
  @ApiResponse({ status: 201, description: 'Questions generated successfully' })
  @ApiResponse({ status: 429, description: 'Daily generation quota exceeded' })
  @ApiResponse({ status: 502, description: 'Gemini upstream error' })
  async generate(
    @CurrentUser() user: User,
    @Body() dto: GenerateQuestionsDto,
  ) {
    const studentId = user.id;
    const questions = await this.questionGenerationService.generateFromBank(
      studentId,
      dto,
    );

    return {
      success: true,
      count: questions.length,
      sourceType: 'BANK_RAG',
      questions,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // US-15: Style-Source Upload
  // ─────────────────────────────────────────────────────────────────────────

  @Post('upload-style-source')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF or image file (≤ 15 MB)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a question sheet for style analysis (US-15)',
    description:
      'Accepts a PDF/image file, stores it in S3 with 24h lifecycle, and dispatches an async BullMQ job to extract the style blueprint via Gemini multimodal.',
  })
  @ApiResponse({ status: 202, description: 'File accepted for processing' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadStyleSource(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const studentId = user.id;
    const result = await this.styleUploadService.uploadAndEnqueue(
      studentId,
      file,
    );

    return {
      success: true,
      message:
        'File accepted. Style extraction is processing asynchronously. Poll the status endpoint to check completion.',
      uploadId: result.uploadId,
      status: result.status,
    };
  }

  @Get('upload-style-source/:id/status')
  @ApiOperation({
    summary: 'Poll style upload extraction status (US-15)',
    description:
      'Returns the current processing status. Returns 422 if extraction failed.',
  })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  @ApiResponse({ status: 422, description: 'Extraction failed' })
  async getUploadStatus(
    @CurrentUser() user: User,
    @Param('id') uploadId: string,
  ) {
    return this.styleUploadService.getUploadStatus(uploadId, user.id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // US-16: Style-Matched Generation
  // ─────────────────────────────────────────────────────────────────────────

  @Post('generate-from-style')
  @UseGuards(GenerationRateLimitGuard)
  @UseInterceptors(QuotaRefundInterceptor)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate style-matched questions grounded in curriculum (US-16)',
    description:
      'Synthesizes questions that emulate the style from an uploaded sheet while being grounded in official exam bank content. Records UPLOAD_STYLE_MATCH source type with full lineage metadata.',
  })
  @ApiResponse({
    status: 201,
    description: 'Style-matched questions generated',
  })
  @ApiResponse({ status: 400, description: 'Style upload not ready' })
  @ApiResponse({ status: 429, description: 'Daily quota exceeded' })
  async generateFromStyle(
    @CurrentUser() user: User,
    @Body() dto: GenerateFromStyleDto,
  ) {
    const studentId = user.id;
    const questions = await this.styleGenerationService.generateFromStyle(
      studentId,
      dto,
    );

    return {
      success: true,
      count: questions.length,
      sourceType: 'UPLOAD_STYLE_MATCH',
      styleUploadId: dto.styleUploadId,
      questions,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // US-17: Quota Status Endpoint
  // ─────────────────────────────────────────────────────────────────────────

  @Get('quota')
  @ApiOperation({
    summary: 'Get remaining daily generation quota (US-17)',
    description:
      'Returns the current daily quota consumption, remaining requests, and UTC reset timestamp.',
  })
  @ApiResponse({ status: 200, description: 'Quota info returned' })
  async getQuota(@CurrentUser() user: User) {
    const studentId = user.id;
    const dailyQuota = this.config.get<number>('DAILY_GENERATION_QUOTA') ?? 20;

    const todayUtc = new Date().toISOString().slice(0, 10);
    const redisKey = `rate_limit:gen:${studentId}:${todayUtc}`;

    const countStr = await this.redis.get(redisKey);
    const usedCount = countStr ? parseInt(countStr, 10) : 0;

    const now = new Date();
    const midnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );

    return {
      quotaLimit: dailyQuota,
      used: usedCount,
      remaining: Math.max(0, dailyQuota - usedCount),
      resetAt: midnight.toISOString(),
    };
  }
}
