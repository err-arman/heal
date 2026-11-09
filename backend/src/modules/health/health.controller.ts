import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService, type HealthStatus } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check application and database health' })
  @ApiOkResponse({ description: 'Application and database are healthy' })
  @ApiServiceUnavailableResponse({ description: 'Database is unavailable' })
  check(): Promise<HealthStatus> {
    return this.healthService.check();
  }
}
