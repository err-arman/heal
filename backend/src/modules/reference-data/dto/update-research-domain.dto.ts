import { PartialType } from '@nestjs/swagger';
import { CreateResearchDomainDto } from './create-research-domain.dto.js';

export class UpdateResearchDomainDto extends PartialType(
  CreateResearchDomainDto,
) {}
