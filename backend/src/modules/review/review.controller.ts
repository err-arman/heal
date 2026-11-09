import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewService } from './review.service.js';

@ApiTags('review')
@Controller('dashboard/research')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':id/review')
  @ApiOperation({ summary: 'Approve or reject research under review' })
  decide(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.decide(id, dto);
  }
}
