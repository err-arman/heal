import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchResources,
  researchReviews,
} from '../../database/schema/index.js';
import { ResearchReadService, type ResearchDetail } from '../research/research-read.service.js';
import { WorkflowService } from '../workflow/workflow.service.js';

@Injectable()
export class PublicationService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly readService: ResearchReadService,
    private readonly workflow: WorkflowService,
  ) {}

  async publish(researchId: string): Promise<ResearchDetail> {
    await this.db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(research)
        .where(eq(research.id, researchId))
        .for('update');

      if (!row) {
        throw new NotFoundException('Research not found.');
      }

      if (row.status !== 'approved') {
        throw new ConflictException(
          'Only approved research can be published.',
        );
      }

      const [review] = await tx
        .select()
        .from(researchReviews)
        .where(eq(researchReviews.researchId, researchId))
        .limit(1);

      if (!review || review.decision !== 'approved') {
        throw new ConflictException(
          'Research cannot be published without an approved review.',
        );
      }

      const [primary] = await tx
        .select({ id: researchResources.id })
        .from(researchResources)
        .where(
          and(
            eq(researchResources.researchId, researchId),
            eq(researchResources.isPrimary, true),
          ),
        )
        .limit(1);

      if (!primary) {
        throw new ConflictException(
          'Research cannot be published without a primary research report.',
        );
      }

      await this.workflow.applyTransition(
        tx,
        researchId,
        'published',
        'Research published.',
      );
    });

    return this.readService.getResearchDetail(researchId);
  }
}
