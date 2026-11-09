import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  fundingSources,
  locations,
  researchDomains,
  studyTypes,
} from '../../database/schema/index.js';
import {
  fundingSourceSeedData,
  locationSeedData,
  researchDomainSeedData,
  studyTypeSeedData,
} from './reference-data.seed-data.js';

@Injectable()
export class ReferenceDataSeedService {
  private readonly logger = new Logger(ReferenceDataSeedService.name);

  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async seed(): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .insert(researchDomains)
        .values(researchDomainSeedData)
        .onConflictDoNothing();
      await tx.insert(studyTypes).values(studyTypeSeedData).onConflictDoNothing();
      await tx
        .insert(fundingSources)
        .values(fundingSourceSeedData)
        .onConflictDoNothing();
      await tx.insert(locations).values(locationSeedData).onConflictDoNothing();
    });

    this.logger.log('Reference data seed completed.');
  }
}
