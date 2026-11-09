import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReferenceItemDto {
  @ApiProperty({ example: 'Maternal and Child Health' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({ example: 'মাতৃ ও শিশু স্বাস্থ্য' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nameBn: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
