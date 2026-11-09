import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchStatusHistory,
  type ResearchStatus,
} from '../../database/schema/index.js';

export type DbTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

const ALLOWED_TRANSITIONS: Record<ResearchStatus, ResearchStatus[]> = {
  submitted: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: ['published'],
  rejected: [],
  published: [],
};

@Injectable()
export class WorkflowService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async transition(
    researchId: string,
    nextStatus: ResearchStatus,
    comment: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.applyTransition(tx, researchId, nextStatus, comment);
    });
  }

  async applyTransition(
    tx: DbTransaction,
    researchId: string,
    nextStatus: ResearchStatus,
    comment: string,
  ): Promise<void> {
    const [row] = await tx
      .select()
      .from(research)
      .where(eq(research.id, researchId))
      .for('update');

    if (!row) {
      throw new NotFoundException('Research not found.');
    }

    const allowed = ALLOWED_TRANSITIONS[row.status];
    if (!allowed.includes(nextStatus)) {
      throw new ConflictException(
        `Cannot transition research from "${row.status}" to "${nextStatus}".`,
      );
    }

    const now = new Date();
    const changes: Partial<typeof research.$inferInsert> = {
      status: nextStatus,
      updatedAt: now,
    };
    if (nextStatus === 'published') {
      changes.publishedAt = now;
    }

    await tx
      .update(research)
      .set(changes)
      .where(eq(research.id, researchId));

    await tx.insert(researchStatusHistory).values({
      researchId,
      previousStatus: row.status,
      newStatus: nextStatus,
      changedAt: now,
      comment,
    });
  }
}
