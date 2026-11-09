import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { reviewDecisionEnum } from './enums.js';
import { research } from './research.js';

export const researchReviews = pgTable(
  'research_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    researchId: uuid('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
    decision: reviewDecisionEnum('decision').notNull(),
    comments: text('comments').notNull(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('research_reviews_research_unique').on(table.researchId),
    index('research_reviews_decision_idx').on(table.decision),
  ],
);
