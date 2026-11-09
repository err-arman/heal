import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { toStreamableFile } from '../resources/resource-download.js';
import { ResourcesService } from '../resources/resources.service.js';
import { PublicResearchQueryDto } from './dto/public-research-query.dto.js';
import { PublicResearchService } from './public-research.service.js';

@ApiTags('public-research')
@Controller('public/research')
export class PublicResearchController {
  constructor(
    private readonly publicResearchService: PublicResearchService,
    private readonly resourcesService: ResourcesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List published research' })
  list(@Query() query: PublicResearchQueryDto) {
    return this.publicResearchService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get published research details' })
  detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.publicResearchService.getById(id);
  }

  @Get(':researchId/resources/:resourceId/download')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Download an attachment of published research' })
  async download(
    @Param('researchId', new ParseUUIDPipe()) researchId: string,
    @Param('resourceId', new ParseUUIDPipe()) resourceId: string,
  ) {
    const { resource, absolutePath } =
      await this.resourcesService.getPublishedResource(researchId, resourceId);
    return toStreamableFile(resource, absolutePath);
  }
}
