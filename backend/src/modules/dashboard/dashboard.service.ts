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
import { escapeLike } from '../../common/query.utils.js';
import { buildPageMeta, type Paginated } from '../../common/pagination.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchTranslations,
  type ResearchStatus,
} from '../../database/schema/index.js';
import { ResearchReadService, type ResearchDetail, type ResearchSummary } from '../research/research-read.service.js';
import { WorkflowService } from '../workflow/workflow.service.js';
import type { DashboardResearchQueryDto } from './dto/dashboard-research-query.dto.js';

export interface DashboardStats {
  total: number;
  byStatus: Record<ResearchStatus, number>;
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly readService: ResearchReadService,
    private readonly workflow: WorkflowService,
  ) {}

  async list(
    query: DashboardResearchQueryDto,
  ): Promise<Paginated<ResearchSummary>> {
    const conditions = this.buildConditions(query);
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const countQuery = this.db
      .select({ value: count() })
      .from(research);
    const totalRows = await (where ? countQuery.where(where) : countQuery);
    const total = Number(totalRows[0]?.value ?? 0);

    const idQuery = this.db.select({ id: research.id }).from(research);
    const rows = await (where ? idQuery.where(where) : idQuery)
      .orderBy(desc(research.submittedAt))
      .limit(query.limit)
      .offset(offset);

    const data = await this.readService.getSummaries(
      rows.map((row) => row.id),
    );

    return { data, meta: buildPageMeta(query.page, query.limit, total) };
  }

  getById(id: string): Promise<ResearchDetail> {
    return this.readService.getResearchDetail(id);
  }

  async stats(): Promise<DashboardStats> {
    const rows = await this.db
      .select({ status: research.status, value: count() })
      .from(research)
      .groupBy(research.status);

    const byStatus: Record<ResearchStatus, number> = {
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      published: 0,
    };

    let total = 0;
    for (const row of rows) {
      const value = Number(row.value);
      byStatus[row.status] = value;
      total += value;
    }

    return { total, byStatus };
  }

  async moveToUnderReview(id: string): Promise<ResearchDetail> {
    await this.workflow.transition(
      id,
      'under_review',
      'Research moved to under review.',
    );
    return this.readService.getResearchDetail(id);
  }

  async getReview(id: string) {
    const detail = await this.readService.getResearchDetail(id);
    return {
      researchId: detail.id,
      status: detail.status,
      review: detail.review,
      statusHistory: detail.statusHistory,
    };
  }

  private buildConditions(query: DashboardResearchQueryDto): SQL[] {
    const conditions: SQL[] = [];

    if (query.status) {
      conditions.push(eq(research.status, query.status));
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
}
