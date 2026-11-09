import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { researchStatusEnum } from './enums.js';
import { research } from './research.js';

export const researchStatusHistory = pgTable(
  'research_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    researchId: uuid('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
    previousStatus: researchStatusEnum('previous_status'),
    newStatus: researchStatusEnum('new_status').notNull(),
    changedAt: timestamp('changed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    comment: text('comment'),
  },
  (table) => [
    index('research_status_history_research_idx').on(table.researchId),
    index('research_status_history_changed_at_idx').on(table.changedAt),
  ],
);
