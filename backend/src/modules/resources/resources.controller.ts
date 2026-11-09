import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { STORAGE_CONFIG } from '../../config/storage.config.js';
import { CreateUploadDto } from './dto/create-upload.dto.js';
import { FILE_CATEGORIES } from './resource.constants.js';
import { ResourcesService } from './resources.service.js';
import type { UploadedFileData } from './storage.service.js';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post('uploads')
  @ApiOperation({ summary: 'Upload a research file to temporary storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'category'],
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string', enum: [...FILE_CATEGORIES] },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      dest: STORAGE_CONFIG.tempDir,
      limits: { fileSize: STORAGE_CONFIG.maxFileSize },
    }),
  )
  upload(
    @UploadedFile() file: UploadedFileData | undefined,
    @Body() dto: CreateUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required.');
    }
    return this.resourcesService.createUpload(file, dto.category);
  }
}
