import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResearchAuthorDto {
  @ApiProperty({ example: 'Dr. Ayesha Rahman' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  name: string;

  @ApiPropertyOptional({ example: 'icddr,b' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  affiliation?: string;

  @ApiPropertyOptional({ example: 'ayesha.rahman@example.org' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;
}
