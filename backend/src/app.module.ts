import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { ReferenceDataModule } from './modules/reference-data/reference-data.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { PublicResearchModule } from './modules/public-research/public-research.module.js';
import { PublicationModule } from './modules/publication/publication.module.js';
import { ResearchModule } from './modules/research/research.module.js';
import { ResourcesModule } from './modules/resources/resources.module.js';
import { ReviewModule } from './modules/review/review.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    DatabaseModule,
    HealthModule,
    ReferenceDataModule,
    ResourcesModule,
    ResearchModule,
    DashboardModule,
    ReviewModule,
    PublicationModule,
    PublicResearchModule,
  ],
})
export class AppModule {}
