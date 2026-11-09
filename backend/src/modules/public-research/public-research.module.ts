import { Module } from '@nestjs/common';
import { ResearchModule } from '../research/research.module.js';
import { ResourcesModule } from '../resources/resources.module.js';
import { PublicResearchController } from './public-research.controller.js';
import { PublicResearchService } from './public-research.service.js';

@Module({
  imports: [ResearchModule, ResourcesModule],
  controllers: [PublicResearchController],
  providers: [PublicResearchService],
})
export class PublicResearchModule {}
