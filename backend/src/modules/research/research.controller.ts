import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateResearchDto } from './dto/create-research.dto.js';
import { ResearchService } from './research.service.js';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a complete research submission' })
  create(@Body() dto: CreateResearchDto) {
    return this.researchService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a research submission' })
  getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.researchService.getById(id);
  }
}
