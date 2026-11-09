import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { isUniqueViolation } from '../../common/db-errors.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchReviews,
} from '../../database/schema/index.js';
import { ResearchReadService, type ResearchDetail } from '../research/research-read.service.js';
import { WorkflowService } from '../workflow/workflow.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly readService: ResearchReadService,
    private readonly workflow: WorkflowService,
  ) {}

  async decide(
    researchId: string,
    dto: CreateReviewDto,
  ): Promise<ResearchDetail> {
    try {
      await this.db.transaction(async (tx) => {
        const [row] = await tx
          .select()
          .from(research)
          .where(eq(research.id, researchId))
          .for('update');

        if (!row) {
          throw new NotFoundException('Research not found.');
        }

        if (row.status !== 'under_review') {
          throw new ConflictException(
            'Research must be under review before a decision can be recorded.',
          );
        }

        const [existing] = await tx
          .select({ id: researchReviews.id })
          .from(researchReviews)
          .where(eq(researchReviews.researchId, researchId))
          .limit(1);

        if (existing) {
          throw new ConflictException(
            'A review decision has already been recorded for this research.',
          );
        }

        const comments = dto.comments.trim();
        const now = new Date();

        await tx.insert(researchReviews).values({
          researchId,
          decision: dto.decision,
          comments,
          reviewedAt: now,
        });

        await this.workflow.applyTransition(
          tx,
          researchId,
          dto.decision,
          comments,
        );
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'A review decision has already been recorded for this research.',
        );
      }
      throw error;
    }

    return this.readService.getResearchDetail(researchId);
  }
}
