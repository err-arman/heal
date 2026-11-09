import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  fundingSources,
  locations,
  research,
  researchAuthors,
  researchDomainAssignments,
  researchDomains,
  researchResources,
  researchReviews,
  researchStatusHistory,
  researchTranslations,
  studyTypes,
  type ResearchStatus,
} from '../../database/schema/index.js';

type ResearchRow = typeof research.$inferSelect;
type ReferenceRow = typeof studyTypes.$inferSelect;
type TranslationRow = typeof researchTranslations.$inferSelect;
type AuthorRow = typeof researchAuthors.$inferSelect;
type DomainRow = typeof researchDomains.$inferSelect;
type ResourceRow = typeof researchResources.$inferSelect;
type ReviewRow = typeof researchReviews.$inferSelect;
type StatusHistoryRow = typeof researchStatusHistory.$inferSelect;

interface BaseRow {
  research: ResearchRow;
  studyType: ReferenceRow;
  fundingSource: ReferenceRow;
  studyLocation: ReferenceRow;
}

export interface TranslationView {
  language: string;
  title: string;
  abstract: string;
  description: string;
  keywords: string[];
}

export interface ResourceView {
  id: string;
  originalFilename: string;
  fileCategory: string;
  mimeType: string;
  fileSize: number;
  checksum: string | null;
  isPrimary: boolean;
  uploadedAt: Date;
}

export interface ResearchSummary {
  id: string;
  submittingOrganizationName: string;
  researchYear: number;
  status: ResearchStatus;
  submittedAt: Date;
  publishedAt: Date | null;
  studyType: ReferenceView;
  fundingSource: ReferenceView;
  studyLocation: ReferenceView;
  translations: {
    en: TranslationView | null;
    bn: TranslationView | null;
  };
  authors: Array<{
    id: string;
    name: string;
    affiliation: string | null;
    authorOrder: number;
  }>;
  domains: ReferenceView[];
  primaryResource: ResourceView | null;
  resourceCount: number;
}

export interface ResearchDetail extends ResearchSummary {
  createdAt: Date;
  updatedAt: Date;
  resources: ResourceView[];
  review:
    | {
        id: string;
        decision: string;
        comments: string;
        reviewedAt: Date;
      }
    | null;
  statusHistory: Array<{
    id: string;
    previousStatus: ResearchStatus | null;
    newStatus: ResearchStatus;
    changedAt: Date;
    comment: string | null;
  }>;
}

export interface ReferenceView {
  id: string;
  nameEn: string;
  nameBn: string;
}

@Injectable()
export class ResearchReadService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getSummaries(
    ids: string[],
    options: { publishedOnly?: boolean } = {},
  ): Promise<ResearchSummary[]> {
    if (ids.length === 0) {
      return [];
    }

    const conditions: SQL[] = [inArray(research.id, ids)];
    if (options.publishedOnly) {
      conditions.push(eq(research.status, 'published'));
    }

    const rows = await this.db
      .select({
        research,
        studyType: studyTypes,
        fundingSource: fundingSources,
        studyLocation: locations,
      })
      .from(research)
      .innerJoin(studyTypes, eq(research.studyTypeId, studyTypes.id))
      .innerJoin(
        fundingSources,
        eq(research.fundingSourceId, fundingSources.id),
      )
      .innerJoin(locations, eq(research.studyLocationId, locations.id))
      .where(and(...conditions));

    const [translations, authors, domains, resources] = await Promise.all([
      this.getTranslationsFor(ids),
      this.getAuthorsFor(ids),
      this.getDomainsFor(ids),
      this.getResourcesFor(ids),
    ]);

    const byId = new Map(rows.map((row) => [row.research.id, row]));
    const summaries: ResearchSummary[] = [];

    for (const id of ids) {
      const row = byId.get(id);
      if (!row) continue;

      summaries.push(
        this.mapSummary(
          row,
          translations.get(id) ?? [],
          authors.get(id) ?? [],
          domains.get(id) ?? [],
          resources.get(id) ?? [],
        ),
      );
    }

    return summaries;
  }

  async getResearchDetail(
    id: string,
    options: { publishedOnly?: boolean } = {},
  ): Promise<ResearchDetail> {
    const where = options.publishedOnly
      ? and(eq(research.id, id), eq(research.status, 'published'))
      : eq(research.id, id);

    const [row] = await this.db
      .select({
        research,
        studyType: studyTypes,
        fundingSource: fundingSources,
        studyLocation: locations,
      })
      .from(research)
      .innerJoin(studyTypes, eq(research.studyTypeId, studyTypes.id))
      .innerJoin(
        fundingSources,
        eq(research.fundingSourceId, fundingSources.id),
      )
      .innerJoin(locations, eq(research.studyLocationId, locations.id))
      .where(where)
      .limit(1);

    if (!row) {
      throw new NotFoundException('Research not found.');
    }

    const [translations, authors, domains, resources, review, statusHistory] =
      await Promise.all([
        this.db
          .select()
          .from(researchTranslations)
          .where(eq(researchTranslations.researchId, id)),
        this.db
          .select()
          .from(researchAuthors)
          .where(eq(researchAuthors.researchId, id))
          .orderBy(asc(researchAuthors.authorOrder)),
        this.db
          .select({ domain: researchDomains })
          .from(researchDomainAssignments)
          .innerJoin(
            researchDomains,
            eq(researchDomainAssignments.researchDomainId, researchDomains.id),
          )
          .where(eq(researchDomainAssignments.researchId, id))
          .orderBy(asc(researchDomains.nameEn)),
        this.db
          .select()
          .from(researchResources)
          .where(eq(researchResources.researchId, id))
          .orderBy(
            desc(researchResources.isPrimary),
            asc(researchResources.uploadedAt),
          ),
        this.db
          .select()
          .from(researchReviews)
          .where(eq(researchReviews.researchId, id))
          .limit(1),
        this.db
          .select()
          .from(researchStatusHistory)
          .where(eq(researchStatusHistory.researchId, id))
          .orderBy(asc(researchStatusHistory.changedAt)),
      ]);

    return {
      ...this.mapSummary(
        row,
        translations,
        authors,
        domains.map((entry) => entry.domain),
        resources,
      ),
      createdAt: row.research.createdAt,
      updatedAt: row.research.updatedAt,
      resources: resources.map((resource) => this.toResourceView(resource)),
      review: review[0] ? this.toReviewView(review[0]) : null,
      statusHistory: statusHistory.map((entry) => this.toHistoryView(entry)),
    };
  }

  async getPrimaryResource(researchId: string): Promise<ResourceRow | null> {
    const [resource] = await this.db
      .select()
      .from(researchResources)
      .where(
        and(
          eq(researchResources.researchId, researchId),
          eq(researchResources.isPrimary, true),
        ),
      )
      .limit(1);

    return resource ?? null;
  }

  private async getTranslationsFor(ids: string[]) {
    const rows = await this.db
      .select()
      .from(researchTranslations)
      .where(inArray(researchTranslations.researchId, ids));
    return groupBy(rows, (row) => row.researchId);
  }

  private async getAuthorsFor(ids: string[]) {
    const rows = await this.db
      .select()
      .from(researchAuthors)
      .where(inArray(researchAuthors.researchId, ids))
      .orderBy(asc(researchAuthors.authorOrder));
    return groupBy(rows, (row) => row.researchId);
  }

  private async getDomainsFor(ids: string[]) {
    const rows = await this.db
      .select({
        researchId: researchDomainAssignments.researchId,
        domain: researchDomains,
      })
      .from(researchDomainAssignments)
      .innerJoin(
        researchDomains,
        eq(researchDomainAssignments.researchDomainId, researchDomains.id),
      )
      .where(inArray(researchDomainAssignments.researchId, ids))
      .orderBy(asc(researchDomains.nameEn));

    return groupBy(rows, (row) => row.researchId).mapValues((entries) =>
      entries.map((entry) => entry.domain),
    );
  }

  private async getResourcesFor(ids: string[]) {
    const rows = await this.db
      .select()
      .from(researchResources)
      .where(inArray(researchResources.researchId, ids))
      .orderBy(
        desc(researchResources.isPrimary),
        asc(researchResources.uploadedAt),
      );
    return groupBy(rows, (row) => row.researchId);
  }

  private mapSummary(
    row: BaseRow,
    translations: TranslationRow[],
    authors: AuthorRow[],
    domains: DomainRow[],
    resources: ResourceRow[],
  ): ResearchSummary {
    const primary = resources.find((resource) => resource.isPrimary) ?? null;

    return {
      id: row.research.id,
      submittingOrganizationName: row.research.submittingOrganizationName,
      researchYear: row.research.researchYear,
      status: row.research.status,
      submittedAt: row.research.submittedAt,
      publishedAt: row.research.publishedAt,
      studyType: this.toReferenceView(row.studyType),
      fundingSource: this.toReferenceView(row.fundingSource),
      studyLocation: this.toReferenceView(row.studyLocation),
      translations: {
        en: this.toTranslationView(translations, 'en'),
        bn: this.toTranslationView(translations, 'bn'),
      },
      authors: authors.map((author) => ({
        id: author.id,
        name: author.name,
        affiliation: author.affiliation,
        authorOrder: author.authorOrder,
      })),
      domains: domains.map((domain) => this.toReferenceView(domain)),
      primaryResource: primary ? this.toResourceView(primary) : null,
      resourceCount: resources.length,
    };
  }

  private toReferenceView(row: ReferenceRow | DomainRow): ReferenceView {
    return { id: row.id, nameEn: row.nameEn, nameBn: row.nameBn };
  }

  private toTranslationView(
    translations: TranslationRow[],
    language: 'en' | 'bn',
  ): TranslationView | null {
    const translation = translations.find(
      (entry) => entry.language === language,
    );
    if (!translation) return null;

    return {
      language: translation.language,
      title: translation.title,
      abstract: translation.abstract,
      description: translation.description,
      keywords: translation.keywords,
    };
  }

  private toResourceView(resource: ResourceRow): ResourceView {
    return {
      id: resource.id,
      originalFilename: resource.originalFilename,
      fileCategory: resource.fileCategory,
      mimeType: resource.mimeType,
      fileSize: resource.fileSize,
      checksum: resource.checksum,
      isPrimary: resource.isPrimary,
      uploadedAt: resource.uploadedAt,
    };
  }

  private toReviewView(review: ReviewRow) {
    return {
      id: review.id,
      decision: review.decision,
      comments: review.comments,
      reviewedAt: review.reviewedAt,
    };
  }

  private toHistoryView(entry: StatusHistoryRow) {
    return {
      id: entry.id,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      changedAt: entry.changedAt,
      comment: entry.comment,
    };
  }
}

class GroupedMap<K, V> extends Map<K, V[]> {
  mapValues<T>(mapper: (values: V[]) => T): Map<K, T> {
    const result = new Map<K, T>();
    for (const [key, values] of this) {
      result.set(key, mapper(values));
    }
    return result;
  }
}

function groupBy<T, K>(rows: T[], key: (row: T) => K): GroupedMap<K, T> {
  const map = new GroupedMap<K, T>();
  for (const row of rows) {
    const groupKey = key(row);
    const group = map.get(groupKey);
    if (group) {
      group.push(row);
    } else {
      map.set(groupKey, [row]);
    }
  }
  return map;
}
