import { buildQuery } from './query';
import { serverApiFetch } from './server';
import type {
  DashboardResearchQuery,
  DashboardStats,
  Paginated,
  PublicResearchQuery,
  ReferenceOptions,
  ResearchDetail,
  ResearchSummary,
  ReviewState,
} from './types';

export function fetchPublicResearch(
  query: PublicResearchQuery,
): Promise<Paginated<ResearchSummary>> {
  return serverApiFetch(
    `/public/research${buildQuery({
      page: query.page,
      limit: query.limit,
      search: query.search,
      domainId: query.domainId,
      studyTypeId: query.studyTypeId,
      fundingSourceId: query.fundingSourceId,
      locationId: query.locationId,
      year: query.year,
    })}`,
  );
}

export function fetchPublicResearchDetail(
  id: string,
): Promise<ResearchDetail> {
  return serverApiFetch(`/public/research/${encodeURIComponent(id)}`);
}

export function fetchReferenceOptions(): Promise<ReferenceOptions> {
  return serverApiFetch('/reference-data/options');
}

export function fetchDashboardResearch(
  query: DashboardResearchQuery,
): Promise<Paginated<ResearchSummary>> {
  return serverApiFetch(
    `/dashboard/research${buildQuery({
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    })}`,
  );
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return serverApiFetch('/dashboard/stats');
}

export function fetchDashboardResearchDetail(
  id: string,
): Promise<ResearchDetail> {
  return serverApiFetch(`/dashboard/research/${encodeURIComponent(id)}`);
}

export function fetchReviewState(id: string): Promise<ReviewState> {
  return serverApiFetch(
    `/dashboard/research/${encodeURIComponent(id)}/review`,
  );
}
