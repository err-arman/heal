import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { fileCategoryEnum } from './enums.js';
import { research } from './research.js';

export const researchResources = pgTable(
  'research_resources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    researchId: uuid('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
    originalFilename: text('original_filename').notNull(),
    storageKey: text('storage_key').notNull(),
    fileCategory: fileCategoryEnum('file_category').notNull(),
    mimeType: text('mime_type').notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).notNull(),
    checksum: text('checksum'),
    isPrimary: boolean('is_primary').notNull().default(false),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('research_resources_storage_key_unique').on(table.storageKey),
    uniqueIndex('research_resources_one_primary_unique')
      .on(table.researchId)
      .where(sql`${table.isPrimary} = true`),
    index('research_resources_research_idx').on(table.researchId),
  ],
);
