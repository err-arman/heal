import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicationService } from './publication.service.js';

@ApiTags('publication')
@Controller('dashboard/research')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish approved research' })
  publish(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.publicationService.publish(id);
  }
}
