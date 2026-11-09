import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import {
  researchStatusEnum,
  type ResearchStatus,
} from '../../../database/schema/index.js';

const STATUSES = researchStatusEnum.enumValues;

export class DashboardResearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn([...STATUSES])
  status?: ResearchStatus;

  @ApiPropertyOptional({
    description: 'Search organization name and English/Bangla metadata.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
