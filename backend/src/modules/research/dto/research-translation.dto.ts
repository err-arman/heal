import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResearchTranslationDto {
  @ApiProperty({ example: 'Maternal health service utilisation in rural Bangladesh' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: 'Research abstract in the selected language.' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  abstract: string;

  @ApiProperty({ description: 'Research description in the selected language.' })
  @IsString()
  @MinLength(10)
  @MaxLength(20000)
  description: string;

  @ApiProperty({ type: [String], example: ['maternal health', 'Bangladesh'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  keywords: string[];
}
