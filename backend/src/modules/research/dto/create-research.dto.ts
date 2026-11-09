import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ResearchAuthorDto } from './research-author.dto.js';
import { ResearchTranslationsDto } from './research-translations.dto.js';
import {
  AttachmentReferenceDto,
  UploadReferenceDto,
} from './upload-reference.dto.js';

const MAX_RESEARCH_YEAR = new Date().getFullYear() + 1;

export class CreateResearchDto {
  @ApiProperty({ example: 'Bangladesh Health Research Institute' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  submittingOrganizationName: string;

  @ApiProperty({ example: 2025 })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(MAX_RESEARCH_YEAR)
  researchYear: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studyTypeId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fundingSourceId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studyLocationId: string;

  @ApiProperty({ type: ResearchTranslationsDto })
  @ValidateNested()
  @Type(() => ResearchTranslationsDto)
  translations: ResearchTranslationsDto;

  @ApiProperty({ type: [ResearchAuthorDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ResearchAuthorDto)
  authors: ResearchAuthorDto[];

  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  domainIds: string[];

  @ApiProperty({ type: UploadReferenceDto })
  @ValidateNested()
  @Type(() => UploadReferenceDto)
  primaryReport: UploadReferenceDto;

  @ApiPropertyOptional({ type: [AttachmentReferenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentReferenceDto)
  attachments?: AttachmentReferenceDto[];
}
