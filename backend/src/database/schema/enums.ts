import { pgEnum } from 'drizzle-orm/pg-core';

export const researchStatusEnum = pgEnum('research_status', [
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'published',
]);

export const contentLanguageEnum = pgEnum('content_language', ['en', 'bn']);

export const fileCategoryEnum = pgEnum('file_category', [
  'primary_report',
  'document',
  'spreadsheet',
  'database',
  'image',
  'audio',
  'video',
  'other',
]);

export const reviewDecisionEnum = pgEnum('review_decision', [
  'approved',
  'rejected',
]);

export type ResearchStatus = (typeof researchStatusEnum.enumValues)[number];
export type ContentLanguage = (typeof contentLanguageEnum.enumValues)[number];
export type FileCategory = (typeof fileCategoryEnum.enumValues)[number];
export type ReviewDecision = (typeof reviewDecisionEnum.enumValues)[number];
