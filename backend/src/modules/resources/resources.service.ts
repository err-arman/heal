import { existsSync } from 'node:fs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchResources,
} from '../../database/schema/index.js';
import type { FileCategoryValue } from './resource.constants.js';
import { StorageService, type UploadedFileData } from './storage.service.js';

export interface ResourceWithPath {
  resource: typeof researchResources.$inferSelect;
  absolutePath: string;
}

@Injectable()
export class ResourcesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly storageService: StorageService,
  ) {}

  createUpload(file: UploadedFileData, category: FileCategoryValue) {
    return this.storageService.saveUpload(file, category);
  }

  async getDashboardResource(id: string): Promise<ResourceWithPath> {
    const [resource] = await this.db
      .select()
      .from(researchResources)
      .where(eq(researchResources.id, id))
      .limit(1);

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    return this.withPath(resource);
  }

  async getPublishedResource(
    researchId: string,
    resourceId: string,
  ): Promise<ResourceWithPath> {
    const [row] = await this.db
      .select({ resource: researchResources })
      .from(researchResources)
      .innerJoin(research, eq(researchResources.researchId, research.id))
      .where(
        and(
          eq(researchResources.id, resourceId),
          eq(researchResources.researchId, researchId),
          eq(research.status, 'published'),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException('Resource not found.');
    }

    return this.withPath(row.resource);
  }

  private withPath(
    resource: typeof researchResources.$inferSelect,
  ): ResourceWithPath {
    const absolutePath = this.storageService.resolveStoragePath(
      resource.storageKey,
    );

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Resource file is missing.');
    }

    return { resource, absolutePath };
  }
}
