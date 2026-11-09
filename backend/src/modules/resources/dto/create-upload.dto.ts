import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  FILE_CATEGORIES,
  type FileCategoryValue,
} from '../resource.constants.js';

export class CreateUploadDto {
  @ApiProperty({
    enum: FILE_CATEGORIES,
    description: 'Category of the uploaded file.',
  })
  @IsIn(FILE_CATEGORIES)
  category: FileCategoryValue;
}
