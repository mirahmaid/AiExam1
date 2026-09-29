import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StagedQuestionStatus } from '@prisma/client';

export class QueryStagedDto {
  @ApiPropertyOptional({ description: 'Filter by exam file ID' })
  @IsOptional()
  @IsString()
  examFileId?: string;

  @ApiPropertyOptional({
    enum: StagedQuestionStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(StagedQuestionStatus)
  status?: StagedQuestionStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
