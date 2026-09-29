import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from '../../common';
import type { User } from '@prisma/client';
import { ExamBankService } from '../services/exam-bank.service';
import { HybridSearchService } from '../services/hybrid-search.service';
import { UploadExamDto, HybridSearchDto, UpdateBankQuestionDto } from '../dto';

@ApiTags('Exam Bank')
@ApiBearerAuth('access-token')
@Controller('admin/exam-bank')
export class ExamBankController {
  constructor(
    private readonly examBankService: ExamBankService,
    private readonly hybridSearchService: HybridSearchService,
  ) {}

  // ── US-10: Upload ─────────────────────────────────────────

  @Roles(Role.ADMIN)
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '[ADMIN] Upload an exam PDF or image for AI extraction',
    description: 'Accepts PDF and image files (JPEG, PNG, WebP, GIF) up to 50 MB.',
  })
  @ApiResponse({ status: 201, description: 'File uploaded, extraction queued' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(pdf|jpeg|jpg|png|webp|gif|octet-stream)/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadExamDto,
    @CurrentUser() user: User,
  ) {
    return this.examBankService.uploadAndEnqueue(file, dto, user.id);
  }

  // ── US-10: Exam File Status ───────────────────────────────

  @Roles(Role.ADMIN)
  @Get('files')
  @ApiOperation({ summary: '[ADMIN] List uploaded exam files' })
  async listFiles(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.examBankService.listExamFiles(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Roles(Role.ADMIN)
  @Get('files/:id')
  @ApiOperation({ summary: '[ADMIN] Get exam file details with staged questions' })
  async getFile(@Param('id') id: string) {
    return this.examBankService.getExamFile(id);
  }

  // ── US-13: Hybrid Search ──────────────────────────────────

  @Roles(Role.ADMIN)
  @Get('search')
  @ApiOperation({
    summary: '[ADMIN] Hybrid search (semantic + keyword + filters)',
  })
  @ApiResponse({ status: 200, description: 'RRF-fused search results' })
  async search(@Query() dto: HybridSearchDto) {
    return this.hybridSearchService.search(dto);
  }

  // ── US-13: Question CRUD ──────────────────────────────────

  @Roles(Role.ADMIN)
  @Get('questions/:id')
  @ApiOperation({ summary: '[ADMIN] Get a published exam bank question' })
  async getQuestion(@Param('id') id: string) {
    return this.examBankService.getBankQuestion(id);
  }

  @Roles(Role.ADMIN)
  @Patch('questions/:id')
  @ApiOperation({
    summary: '[ADMIN] Update a published question (triggers re-indexing)',
  })
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateBankQuestionDto,
  ) {
    return this.examBankService.updateBankQuestion(id, dto as Record<string, unknown>);
  }

  @Roles(Role.ADMIN)
  @Delete('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Soft-delete a published question' })
  async deleteQuestion(@Param('id') id: string) {
    return this.examBankService.softDeleteBankQuestion(id);
  }
}
