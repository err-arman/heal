import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const referenceColumns = {
  id: uuid('id').primaryKey().defaultRandom(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const researchDomains = pgTable(
  'research_domains',
  {
    ...referenceColumns,
    descriptionEn: text('description_en'),
    descriptionBn: text('description_bn'),
  },
  (table) => [
    uniqueIndex('research_domains_name_en_unique').on(table.nameEn),
    uniqueIndex('research_domains_name_bn_unique').on(table.nameBn),
    index('research_domains_is_active_idx').on(table.isActive),
  ],
);

export const studyTypes = pgTable(
  'study_types',
  {
    ...referenceColumns,
  },
  (table) => [
    uniqueIndex('study_types_name_en_unique').on(table.nameEn),
    uniqueIndex('study_types_name_bn_unique').on(table.nameBn),
    index('study_types_is_active_idx').on(table.isActive),
  ],
);

export const fundingSources = pgTable(
  'funding_sources',
  {
    ...referenceColumns,
  },
  (table) => [
    uniqueIndex('funding_sources_name_en_unique').on(table.nameEn),
    uniqueIndex('funding_sources_name_bn_unique').on(table.nameBn),
    index('funding_sources_is_active_idx').on(table.isActive),
  ],
);

export const locations = pgTable(
  'locations',
  {
    ...referenceColumns,
  },
  (table) => [
    uniqueIndex('locations_name_en_unique').on(table.nameEn),
    uniqueIndex('locations_name_bn_unique').on(table.nameBn),
    index('locations_is_active_idx').on(table.isActive),
  ],
);
