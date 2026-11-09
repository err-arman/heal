import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { isUniqueViolation } from '../../common/db-errors.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  fundingSources,
  locations,
  researchDomains,
  studyTypes,
} from '../../database/schema/index.js';
import type { CreateReferenceItemDto } from './dto/create-reference-item.dto.js';
import type { CreateResearchDomainDto } from './dto/create-research-domain.dto.js';
import type { UpdateReferenceItemDto } from './dto/update-reference-item.dto.js';
import type { UpdateResearchDomainDto } from './dto/update-research-domain.dto.js';

@Injectable()
export class ReferenceDataService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getOptions() {
    const [domains, studyTypeOptions, fundingSourceOptions, locationOptions] =
      await Promise.all([
        this.listActiveDomains(),
        this.listActiveStudyTypes(),
        this.listActiveFundingSources(),
        this.listActiveLocations(),
      ]);

    return {
      domains,
      studyTypes: studyTypeOptions,
      fundingSources: fundingSourceOptions,
      locations: locationOptions,
    };
  }

  listDomains() {
    return this.db
      .select()
      .from(researchDomains)
      .orderBy(asc(researchDomains.nameEn));
  }

  listActiveDomains() {
    return this.db
      .select()
      .from(researchDomains)
      .where(eq(researchDomains.isActive, true))
      .orderBy(asc(researchDomains.nameEn));
  }

  listStudyTypes() {
    return this.db.select().from(studyTypes).orderBy(asc(studyTypes.nameEn));
  }

  listActiveStudyTypes() {
    return this.db
      .select()
      .from(studyTypes)
      .where(eq(studyTypes.isActive, true))
      .orderBy(asc(studyTypes.nameEn));
  }

  listFundingSources() {
    return this.db
      .select()
      .from(fundingSources)
      .orderBy(asc(fundingSources.nameEn));
  }

  listActiveFundingSources() {
    return this.db
      .select()
      .from(fundingSources)
      .where(eq(fundingSources.isActive, true))
      .orderBy(asc(fundingSources.nameEn));
  }

  listLocations() {
    return this.db.select().from(locations).orderBy(asc(locations.nameEn));
  }

  listActiveLocations() {
    return this.db
      .select()
      .from(locations)
      .where(eq(locations.isActive, true))
      .orderBy(asc(locations.nameEn));
  }

  async createDomain(dto: CreateResearchDomainDto) {
    try {
      const [row] = await this.db
        .insert(researchDomains)
        .values({
          nameEn: dto.nameEn.trim(),
          nameBn: dto.nameBn.trim(),
          descriptionEn: dto.descriptionEn?.trim(),
          descriptionBn: dto.descriptionBn?.trim(),
          isActive: dto.isActive ?? true,
        })
        .returning();
      return row;
    } catch (error) {
      this.rethrowWriteError(error, 'Research domain');
    }
  }

  async updateDomain(id: string, dto: UpdateResearchDomainDto) {
    const changes: Partial<typeof researchDomains.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (dto.nameEn !== undefined) changes.nameEn = dto.nameEn.trim();
    if (dto.nameBn !== undefined) changes.nameBn = dto.nameBn.trim();
    if (dto.descriptionEn !== undefined) {
      changes.descriptionEn = dto.descriptionEn.trim();
    }
    if (dto.descriptionBn !== undefined) {
      changes.descriptionBn = dto.descriptionBn.trim();
    }
    if (dto.isActive !== undefined) changes.isActive = dto.isActive;

    try {
      const [row] = await this.db
        .update(researchDomains)
        .set(changes)
        .where(eq(researchDomains.id, id))
        .returning();
      if (!row) {
        throw new NotFoundException('Research domain not found.');
      }
      return row;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.rethrowWriteError(error, 'Research domain');
    }
  }

  async createStudyType(dto: CreateReferenceItemDto) {
    return this.createReferenceItem(studyTypes, dto, 'Study type');
  }

  async updateStudyType(id: string, dto: UpdateReferenceItemDto) {
    return this.updateReferenceItem(studyTypes, id, dto, 'Study type');
  }

  async createFundingSource(dto: CreateReferenceItemDto) {
    return this.createReferenceItem(fundingSources, dto, 'Funding source');
  }

  async updateFundingSource(id: string, dto: UpdateReferenceItemDto) {
    return this.updateReferenceItem(
      fundingSources,
      id,
      dto,
      'Funding source',
    );
  }

  async createLocation(dto: CreateReferenceItemDto) {
    return this.createReferenceItem(locations, dto, 'Location');
  }

  async updateLocation(id: string, dto: UpdateReferenceItemDto) {
    return this.updateReferenceItem(locations, id, dto, 'Location');
  }

  async assertActiveStudyType(id: string): Promise<void> {
    const [row] = await this.db
      .select({ id: studyTypes.id })
      .from(studyTypes)
      .where(and(eq(studyTypes.id, id), eq(studyTypes.isActive, true)))
      .limit(1);
    if (!row) {
      throw new BadRequestException('Unknown or inactive study type.');
    }
  }

  async assertActiveFundingSource(id: string): Promise<void> {
    const [row] = await this.db
      .select({ id: fundingSources.id })
      .from(fundingSources)
      .where(and(eq(fundingSources.id, id), eq(fundingSources.isActive, true)))
      .limit(1);
    if (!row) {
      throw new BadRequestException('Unknown or inactive funding source.');
    }
  }

  async assertActiveLocation(id: string): Promise<void> {
    const [row] = await this.db
      .select({ id: locations.id })
      .from(locations)
      .where(and(eq(locations.id, id), eq(locations.isActive, true)))
      .limit(1);
    if (!row) {
      throw new BadRequestException('Unknown or inactive location.');
    }
  }

  async assertActiveDomains(ids: string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException('Duplicate research domains are not allowed.');
    }

    const rows = await this.db
      .select({ id: researchDomains.id })
      .from(researchDomains)
      .where(
        and(
          inArray(researchDomains.id, uniqueIds),
          eq(researchDomains.isActive, true),
        ),
      );

    if (rows.length !== uniqueIds.length) {
      throw new BadRequestException('One or more research domains are unknown or inactive.');
    }
  }

  private async createReferenceItem(
    table: typeof studyTypes | typeof fundingSources | typeof locations,
    dto: CreateReferenceItemDto,
    label: string,
  ) {
    try {
      const [row] = await this.db
        .insert(table)
        .values({
          nameEn: dto.nameEn.trim(),
          nameBn: dto.nameBn.trim(),
          isActive: dto.isActive ?? true,
        })
        .returning();
      return row;
    } catch (error) {
      this.rethrowWriteError(error, label);
    }
  }

  private async updateReferenceItem(
    table: typeof studyTypes | typeof fundingSources | typeof locations,
    id: string,
    dto: UpdateReferenceItemDto,
    label: string,
  ) {
    const changes: Partial<CreateReferenceItemDto> = {};
    if (dto.nameEn !== undefined) changes.nameEn = dto.nameEn.trim();
    if (dto.nameBn !== undefined) changes.nameBn = dto.nameBn.trim();
    if (dto.isActive !== undefined) changes.isActive = dto.isActive;

    try {
      const [row] = await this.db
        .update(table)
        .set({ ...changes, updatedAt: new Date() })
        .where(eq(table.id, id))
        .returning();
      if (!row) {
        throw new NotFoundException(`${label} not found.`);
      }
      return row;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.rethrowWriteError(error, label);
    }
  }

  private rethrowWriteError(error: unknown, label: string): never {
    if (isUniqueViolation(error)) {
      throw new ConflictException(`${label} names must be unique.`);
    }
    throw error;
  }
}
