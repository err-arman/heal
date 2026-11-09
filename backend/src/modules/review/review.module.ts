import { Module } from '@nestjs/common';
import { ResearchModule } from '../research/research.module.js';
import { WorkflowModule } from '../workflow/workflow.module.js';
import { ReviewController } from './review.controller.js';
import { ReviewService } from './review.service.js';

@Module({
  imports: [ResearchModule, WorkflowModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
