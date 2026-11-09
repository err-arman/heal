import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { toStreamableFile } from '../resources/resource-download.js';
import { ResourcesService } from '../resources/resources.service.js';
import { DashboardResearchQueryDto } from './dto/dashboard-research-query.dto.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly resourcesService: ResourcesService,
  ) {}

  @Get('research')
  @ApiOperation({ summary: 'List all submissions' })
  list(@Query() query: DashboardResearchQueryDto) {
    return this.dashboardService.list(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Count submissions by status' })
  stats() {
    return this.dashboardService.stats();
  }

  @Get('research/:id')
  @ApiOperation({ summary: 'Get a submission with attachments and history' })
  detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.dashboardService.getById(id);
  }

  @Post('research/:id/under-review')
  @ApiOperation({ summary: 'Move a submitted record to under review' })
  moveToUnderReview(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.dashboardService.moveToUnderReview(id);
  }

  @Get('research/:id/review')
  @ApiOperation({ summary: 'Get review information for a submission' })
  review(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.dashboardService.getReview(id);
  }

  @Get('resources/:id/download')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Download an attachment from the dashboard' })
  async download(@Param('id', new ParseUUIDPipe()) id: string) {
    const { resource, absolutePath } =
      await this.resourcesService.getDashboardResource(id);
    return toStreamableFile(resource, absolutePath);
  }
}
