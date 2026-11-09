import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller.js';
import { ResourcesService } from './resources.service.js';
import { StorageService } from './storage.service.js';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService, StorageService],
  exports: [ResourcesService, StorageService],
})
export class ResourcesModule {}
