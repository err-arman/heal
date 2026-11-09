export const RESEARCH_STATUSES = [
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'published',
] as const;

export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

export const FILE_CATEGORIES = [
  'primary_report',
  'document',
  'spreadsheet',
  'database',
  'image',
  'audio',
  'video',
  'other',
] as const;

export type FileCategory = (typeof FILE_CATEGORIES)[number];

export const ATTACHMENT_CATEGORIES = FILE_CATEGORIES.filter(
  (category): category is Exclude<FileCategory, 'primary_report'> =>
    category !== 'primary_report',
);

export type AttachmentCategory = Exclude<FileCategory, 'primary_report'>;
export type ReviewDecision = 'approved' | 'rejected';

export interface ReferenceItem {
  id: string;
  nameEn: string;
  nameBn: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchDomain extends ReferenceItem {
  descriptionEn?: string | null;
  descriptionBn?: string | null;
}

export interface ReferenceOptions {
  domains: ResearchDomain[];
  studyTypes: ReferenceItem[];
  fundingSources: ReferenceItem[];
  locations: ReferenceItem[];
}

export interface Translation {
  language: string;
  title: string;
  abstract: string;
  description: string;
  keywords: string[];
}

export interface ResearchAuthor {
  id?: string;
  name: string;
  affiliation?: string | null;
  email?: string | null;
  authorOrder?: number;
}

export interface ResearchResource {
  id: string;
  originalFilename: string;
  fileCategory: FileCategory | string;
  mimeType: string;
  fileSize: number;
  checksum?: string | null;
  isPrimary: boolean;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface ResearchSummary {
  id: string;
  submittingOrganizationName: string;
  researchYear: number;
  status: ResearchStatus;
  submittedAt: string;
  publishedAt: string | null;
  studyType: ReferenceItem;
  fundingSource: ReferenceItem;
  studyLocation: ReferenceItem;
  translations: {
    en: Translation | null;
    bn: Translation | null;
  };
  authors: ResearchAuthor[];
  domains: ReferenceItem[];
  primaryResource: ResearchResource | null;
  resourceCount: number;
}

export interface ReviewRecord {
  id: string;
  decision: ReviewDecision;
  comments: string;
  reviewedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  previousStatus: ResearchStatus | null;
  newStatus: ResearchStatus;
  changedAt: string;
  comment: string | null;
}

export interface ResearchDetail extends ResearchSummary {
  createdAt: string;
  updatedAt: string;
  resources: ResearchResource[];
  review: ReviewRecord | null;
  statusHistory: StatusHistoryEntry[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export type StatusCounts = Record<ResearchStatus, number>;

export interface DashboardStats {
  total: number;
  byStatus: StatusCounts;
}

export interface ReviewState {
  researchId: string;
  status: ResearchStatus;
  review: ReviewRecord | null;
  statusHistory: StatusHistoryEntry[];
}

export interface StoredUpload {
  uploadId: string;
  storageKey?: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  category: FileCategory;
  uploadedAt: string;
}

export interface ResearchAuthorInput {
  name: string;
  affiliation?: string;
  email?: string;
}

export interface AttachmentInput {
  uploadId: string;
  category: AttachmentCategory;
}

export interface CreateResearchPayload {
  submittingOrganizationName: string;
  researchYear: number;
  studyTypeId: string;
  fundingSourceId: string;
  studyLocationId: string;
  translations: {
    en: Translation;
    bn: Translation;
  };
  authors: ResearchAuthorInput[];
  domainIds: string[];
  primaryReport: { uploadId: string };
  attachments?: AttachmentInput[];
}

export interface ReviewPayload {
  decision: ReviewDecision;
  comments: string;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface PublicResearchQuery {
  page?: number;
  limit?: number;
  search?: string;
  domainId?: string;
  studyTypeId?: string;
  fundingSourceId?: string;
  locationId?: string;
  year?: number;
}

export interface DashboardResearchQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ResearchStatus;
}
