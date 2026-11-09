import { Module } from '@nestjs/common';
import { ReferenceDataModule } from '../reference-data/reference-data.module.js';
import { ResourcesModule } from '../resources/resources.module.js';
import { ResearchController } from './research.controller.js';
import { ResearchReadService } from './research-read.service.js';
import { ResearchService } from './research.service.js';

@Module({
  imports: [ReferenceDataModule, ResourcesModule],
  controllers: [ResearchController],
  providers: [ResearchService, ResearchReadService],
  exports: [ResearchReadService],
})
export class ResearchModule {}
