import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import {
  reviewDecisionEnum,
  type ReviewDecision,
} from '../../../database/schema/index.js';

const DECISIONS = reviewDecisionEnum.enumValues;

export class CreateReviewDto {
  @ApiProperty({ enum: DECISIONS })
  @IsIn([...DECISIONS])
  decision: ReviewDecision;

  @ApiProperty({ description: 'Explanation for the decision.' })
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  comments: string;
}
