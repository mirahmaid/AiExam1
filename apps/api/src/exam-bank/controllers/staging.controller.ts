import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from '../../common';
import type { User } from '@prisma/client';
import { StagingService } from '../services/staging.service';
import {
  ApproveQuestionDto,
  UpdateStagedQuestionDto,
  QueryStagedDto,
} from '../dto';

@ApiTags('Staged Questions')
@ApiBearerAuth('access-token')
@Controller('admin/staged-questions')
export class StagingController {
  constructor(private readonly staging: StagingService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: '[ADMIN] List staged questions' })
  @ApiResponse({ status: 200, description: 'Paginated list of staged questions' })
  async list(@Query() query: QueryStagedDto) {
    return this.staging.list(query);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: '[ADMIN] Get a staged question by ID' })
  @ApiResponse({ status: 200, description: 'Staged question details' })
  @ApiResponse({ status: 404, description: 'Staged question not found' })
  async getById(@Param('id') id: string) {
    return this.staging.getById(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[ADMIN] Edit a staged question draft' })
  @ApiResponse({ status: 200, description: 'Staged question updated' })
  @ApiResponse({ status: 404, description: 'Staged question not found' })
  @ApiResponse({ status: 409, description: 'Cannot edit non-PENDING question' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStagedQuestionDto,
  ) {
    return this.staging.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Post(':id/approve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[ADMIN] Approve staged question with pedagogical metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'Question approved and published to exam bank',
  })
  @ApiResponse({ status: 404, description: 'Staged question not found' })
  @ApiResponse({ status: 409, description: 'Question already processed' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveQuestionDto,
    @CurrentUser() user: User,
  ) {
    return this.staging.approve(id, dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Reject a staged question' })
  @ApiResponse({ status: 200, description: 'Question rejected' })
  @ApiResponse({ status: 404, description: 'Staged question not found' })
  @ApiResponse({ status: 409, description: 'Question already processed' })
  async reject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.staging.reject(id, user.id);
  }
}
