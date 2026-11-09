import { Module } from '@nestjs/common';
import { ResearchModule } from '../research/research.module.js';
import { ResourcesModule } from '../resources/resources.module.js';
import { WorkflowModule } from '../workflow/workflow.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [ResearchModule, ResourcesModule, WorkflowModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
