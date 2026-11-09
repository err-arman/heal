import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReferenceItemDto } from './dto/create-reference-item.dto.js';
import { CreateResearchDomainDto } from './dto/create-research-domain.dto.js';
import { UpdateReferenceItemDto } from './dto/update-reference-item.dto.js';
import { UpdateResearchDomainDto } from './dto/update-research-domain.dto.js';
import { ReferenceDataService } from './reference-data.service.js';

@ApiTags('reference-data')
@Controller('reference-data')
export class ReferenceDataController {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  @Get('options')
  @ApiOperation({ summary: 'Get active options for the submission form' })
  getOptions() {
    return this.referenceDataService.getOptions();
  }

  @Get('domains')
  @ApiOperation({ summary: 'List all research domains' })
  listDomains() {
    return this.referenceDataService.listDomains();
  }

  @Post('domains')
  @ApiOperation({ summary: 'Create a research domain' })
  createDomain(@Body() dto: CreateResearchDomainDto) {
    return this.referenceDataService.createDomain(dto);
  }

  @Patch('domains/:id')
  @ApiOperation({ summary: 'Update a research domain' })
  updateDomain(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateResearchDomainDto,
  ) {
    return this.referenceDataService.updateDomain(id, dto);
  }

  @Get('study-types')
  @ApiOperation({ summary: 'List all study types' })
  listStudyTypes() {
    return this.referenceDataService.listStudyTypes();
  }

  @Post('study-types')
  @ApiOperation({ summary: 'Create a study type' })
  createStudyType(@Body() dto: CreateReferenceItemDto) {
    return this.referenceDataService.createStudyType(dto);
  }

  @Patch('study-types/:id')
  @ApiOperation({ summary: 'Update a study type' })
  updateStudyType(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReferenceItemDto,
  ) {
    return this.referenceDataService.updateStudyType(id, dto);
  }

  @Get('funding-sources')
  @ApiOperation({ summary: 'List all funding sources' })
  listFundingSources() {
    return this.referenceDataService.listFundingSources();
  }

  @Post('funding-sources')
  @ApiOperation({ summary: 'Create a funding source' })
  createFundingSource(@Body() dto: CreateReferenceItemDto) {
    return this.referenceDataService.createFundingSource(dto);
  }

  @Patch('funding-sources/:id')
  @ApiOperation({ summary: 'Update a funding source' })
  updateFundingSource(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReferenceItemDto,
  ) {
    return this.referenceDataService.updateFundingSource(id, dto);
  }

  @Get('locations')
  @ApiOperation({ summary: 'List all locations' })
  listLocations() {
    return this.referenceDataService.listLocations();
  }

  @Post('locations')
  @ApiOperation({ summary: 'Create a location' })
  createLocation(@Body() dto: CreateReferenceItemDto) {
    return this.referenceDataService.createLocation(dto);
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update a location' })
  updateLocation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReferenceItemDto,
  ) {
    return this.referenceDataService.updateLocation(id, dto);
  }
}
