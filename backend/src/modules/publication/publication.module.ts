import { Module } from '@nestjs/common';
import { ResearchModule } from '../research/research.module.js';
import { WorkflowModule } from '../workflow/workflow.module.js';
import { PublicationController } from './publication.controller.js';
import { PublicationService } from './publication.service.js';

@Module({
  imports: [ResearchModule, WorkflowModule],
  controllers: [PublicationController],
  providers: [PublicationService],
})
export class PublicationModule {}
