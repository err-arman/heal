import '../config/load-env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { ReferenceDataSeedService } from '../modules/reference-data/reference-data-seed.service.js';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    await app.get(ReferenceDataSeedService).seed();
  } finally {
    await app.close();
  }
}

await main();
