import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { buildPageMeta } from '../../common/pagination.js';
import { escapeLike } from '../../common/query.utils.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchDomainAssignments,
  researchTranslations,
} from '../../database/schema/index.js';
import {
  ResearchReadService,
  type ResearchDetail,
  type ResearchSummary,
} from '../research/research-read.service.js';
import type { PublicResearchQueryDto } from './dto/public-research-query.dto.js';

@Injectable()
export class PublicResearchService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly readService: ResearchReadService,
  ) {}

  async list(query: PublicResearchQueryDto) {
    const conditions = this.buildConditions(query);
    const where = and(...conditions);
    const offset = (query.page - 1) * query.limit;

    const countQuery = this.db.select({ value: count() }).from(research);
    const totalRows = await countQuery.where(where);
    const total = Number(totalRows[0]?.value ?? 0);

    const rows = await this.db
      .select({ id: research.id })
      .from(research)
      .where(where)
      .orderBy(desc(research.publishedAt), desc(research.submittedAt))
      .limit(query.limit)
      .offset(offset);

    const summaries = await this.readService.getSummaries(
      rows.map((row) => row.id),
      { publishedOnly: true },
    );

    const data = summaries.map((summary) => this.toPublicSummary(summary));

    return {
      data,
      meta: buildPageMeta(query.page, query.limit, total),
    };
  }

  async getById(id: string) {
    const detail = await this.readService.getResearchDetail(id, {
      publishedOnly: true,
    });

    return this.toPublicDetail(detail);
  }

  private buildConditions(query: PublicResearchQueryDto): SQL[] {
    const conditions: SQL[] = [eq(research.status, 'published')];

    if (query.studyTypeId) {
      conditions.push(eq(research.studyTypeId, query.studyTypeId));
    }
    if (query.fundingSourceId) {
      conditions.push(eq(research.fundingSourceId, query.fundingSourceId));
    }
    if (query.locationId) {
      conditions.push(eq(research.studyLocationId, query.locationId));
    }
    if (query.year !== undefined) {
      conditions.push(eq(research.researchYear, query.year));
    }
    if (query.domainId) {
      conditions.push(
        inArray(
          research.id,
          this.db
            .select({ researchId: researchDomainAssignments.researchId })
            .from(researchDomainAssignments)
            .where(
              eq(
                researchDomainAssignments.researchDomainId,
                query.domainId,
              ),
            ),
        ),
      );
    }

    const search = query.search?.trim();
    if (search) {
      const pattern = `%${escapeLike(search)}%`;
      const translationMatches = this.db
        .select({ researchId: researchTranslations.researchId })
        .from(researchTranslations)
        .where(
          or(
            ilike(researchTranslations.title, pattern),
            ilike(researchTranslations.abstract, pattern),
            ilike(researchTranslations.description, pattern),
            sql`array_to_string(${researchTranslations.keywords}, ' ') ILIKE ${pattern}`,
          ),
        );

      const searchCondition = or(
        ilike(research.submittingOrganizationName, pattern),
        inArray(research.id, translationMatches),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    return conditions;
  }

  private toPublicSummary(summary: ResearchSummary) {
    return {
      ...summary,
      primaryResource: summary.primaryResource
        ? {
            ...summary.primaryResource,
            downloadUrl: this.downloadUrl(
              summary.id,
              summary.primaryResource.id,
            ),
          }
        : null,
    };
  }

  private toPublicDetail(detail: ResearchDetail) {
    return {
      ...detail,
      primaryResource: detail.primaryResource
        ? {
            ...detail.primaryResource,
            downloadUrl: this.downloadUrl(
              detail.id,
              detail.primaryResource.id,
            ),
          }
        : null,
      resources: detail.resources.map((resource) => ({
        ...resource,
        downloadUrl: this.downloadUrl(detail.id, resource.id),
      })),
    };
  }

  private downloadUrl(researchId: string, resourceId: string): string {
    return `/public/research/${researchId}/resources/${resourceId}/download`;
  }
}
