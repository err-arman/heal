import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { contentLanguageEnum, researchStatusEnum } from './enums.js';
import {
  fundingSources,
  locations,
  researchDomains,
  studyTypes,
} from './reference-data.js';

export const research = pgTable(
  'research',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submittingOrganizationName: text('submitting_organization_name').notNull(),
    researchYear: integer('research_year').notNull(),
    studyTypeId: uuid('study_type_id')
      .notNull()
      .references(() => studyTypes.id, { onDelete: 'restrict' }),
    fundingSourceId: uuid('funding_source_id')
      .notNull()
      .references(() => fundingSources.id, { onDelete: 'restrict' }),
    studyLocationId: uuid('study_location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'restrict' }),
    status: researchStatusEnum('status').notNull().default('submitted'),
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (table) => [
    index('research_status_idx').on(table.status),
    index('research_published_at_idx').on(table.publishedAt),
    index('research_year_idx').on(table.researchYear),
    index('research_study_type_idx').on(table.studyTypeId),
    index('research_funding_source_idx').on(table.fundingSourceId),
    index('research_location_idx').on(table.studyLocationId),
  ],
);

export const researchTranslations = pgTable(
  'research_translations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    researchId: uuid('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
    language: contentLanguageEnum('language').notNull(),
    title: text('title').notNull(),
    abstract: text('abstract').notNull(),
    description: text('description').notNull(),
    keywords: text('keywords').array().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('research_translations_research_language_unique').on(
      table.researchId,
      table.language,
    ),
    index('research_translations_research_idx').on(table.researchId),
  ],
);

export const researchAuthors = pgTable(
  'research_authors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    researchId: uuid('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    affiliation: text('affiliation'),
    email: text('email'),
    authorOrder: integer('author_order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('research_authors_research_order_unique').on(
      table.researchId,
      table.authorOrder,
    ),
    index('research_authors_research_idx').on(table.researchId),
  ],
);

export const researchDomainAssignments = pgTable(
  'research_domain_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    researchId: uuid('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
    researchDomainId: uuid('research_domain_id')
      .notNull()
      .references(() => researchDomains.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('research_domain_assignments_unique').on(
      table.researchId,
      table.researchDomainId,
    ),
    index('research_domain_assignments_domain_idx').on(table.researchDomainId),
  ],
);
