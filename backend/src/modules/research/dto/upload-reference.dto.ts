import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { ATTACHMENT_CATEGORIES } from '../../resources/resource.constants.js';

export class UploadReferenceDto {
  @ApiProperty({ description: 'Upload identifier returned by POST /resources/uploads.' })
  @IsUUID()
  uploadId: string;
}

export class AttachmentReferenceDto extends UploadReferenceDto {
  @ApiProperty({ enum: [...ATTACHMENT_CATEGORIES] })
  @IsIn([...ATTACHMENT_CATEGORIES])
  category: (typeof ATTACHMENT_CATEGORIES)[number];
}
