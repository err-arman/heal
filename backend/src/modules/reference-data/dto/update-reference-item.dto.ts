import { PartialType } from '@nestjs/swagger';
import { CreateReferenceItemDto } from './create-reference-item.dto.js';

export class UpdateReferenceItemDto extends PartialType(CreateReferenceItemDto) {}
