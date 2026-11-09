import { Module } from '@nestjs/common';
import { ReferenceDataSeedService } from './reference-data-seed.service.js';
import { ReferenceDataController } from './reference-data.controller.js';
import { ReferenceDataService } from './reference-data.service.js';

@Module({
  controllers: [ReferenceDataController],
  providers: [ReferenceDataService, ReferenceDataSeedService],
  exports: [ReferenceDataService, ReferenceDataSeedService],
})
export class ReferenceDataModule {}
