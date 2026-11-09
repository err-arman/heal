import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ResearchTranslationDto } from './research-translation.dto.js';

export class ResearchTranslationsDto {
  @ApiProperty({ type: ResearchTranslationDto })
  @ValidateNested()
  @Type(() => ResearchTranslationDto)
  en: ResearchTranslationDto;

  @ApiProperty({ type: ResearchTranslationDto })
  @ValidateNested()
  @Type(() => ResearchTranslationDto)
  bn: ResearchTranslationDto;
}
