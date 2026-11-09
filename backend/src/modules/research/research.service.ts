import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { isUniqueViolation } from '../../common/db-errors.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { Database } from '../../database/database.module.js';
import {
  research,
  researchAuthors,
  researchDomainAssignments,
  researchResources,
  researchStatusHistory,
  researchTranslations,
} from '../../database/schema/index.js';
import { ReferenceDataService } from '../reference-data/reference-data.service.js';
import { StorageService, type StoredUpload } from '../resources/storage.service.js';
import type { CreateResearchDto } from './dto/create-research.dto.js';
import { ResearchReadService, type ResearchDetail } from './research-read.service.js';

@Injectable()
export class ResearchService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly referenceData: ReferenceDataService,
    private readonly storage: StorageService,
    private readonly readService: ResearchReadService,
  ) {}

  async create(dto: CreateResearchDto): Promise<ResearchDetail> {
    await Promise.all([
      this.referenceData.assertActiveStudyType(dto.studyTypeId),
      this.referenceData.assertActiveFundingSource(dto.fundingSourceId),
      this.referenceData.assertActiveLocation(dto.studyLocationId),
      this.referenceData.assertActiveDomains(dto.domainIds),
    ]);

    const primaryUpload = await this.storage.getUpload(dto.primaryReport.uploadId);
    if (primaryUpload.category !== 'primary_report') {
      throw new BadRequestException(
        'The primary report upload must use the primary_report category.',
      );
    }

    const attachmentUploads = await this.resolveAttachments(
      dto,
      primaryUpload,
    );
    const allUploads = [primaryUpload, ...attachmentUploads];

    try {
      const researchId = await this.db.transaction(async (tx) => {
        const [created] = await tx
          .insert(research)
          .values({
            submittingOrganizationName:
              dto.submittingOrganizationName.trim(),
            researchYear: dto.researchYear,
            studyTypeId: dto.studyTypeId,
            fundingSourceId: dto.fundingSourceId,
            studyLocationId: dto.studyLocationId,
            status: 'submitted',
          })
          .returning({ id: research.id });

        const id = created.id;

        await tx.insert(researchTranslations).values([
          {
            researchId: id,
            language: 'en',
            title: dto.translations.en.title.trim(),
            abstract: dto.translations.en.abstract.trim(),
            description: dto.translations.en.description.trim(),
            keywords: dto.translations.en.keywords.map((keyword) =>
              keyword.trim(),
            ),
          },
          {
            researchId: id,
            language: 'bn',
            title: dto.translations.bn.title.trim(),
            abstract: dto.translations.bn.abstract.trim(),
            description: dto.translations.bn.description.trim(),
            keywords: dto.translations.bn.keywords.map((keyword) =>
              keyword.trim(),
            ),
          },
        ]);

        await tx.insert(researchAuthors).values(
          dto.authors.map((author, index) => ({
            researchId: id,
            name: author.name.trim(),
            affiliation: author.affiliation?.trim(),
            email: author.email?.trim(),
            authorOrder: index + 1,
          })),
        );

        await tx.insert(researchDomainAssignments).values(
          dto.domainIds.map((domainId) => ({
            researchId: id,
            researchDomainId: domainId,
          })),
        );

        await tx.insert(researchResources).values([
          this.toResourceInsert(id, primaryUpload, true),
          ...attachmentUploads.map((upload) =>
            this.toResourceInsert(id, upload, false),
          ),
        ]);

        await tx.insert(researchStatusHistory).values({
          researchId: id,
          previousStatus: null,
          newStatus: 'submitted',
          comment: 'Research submitted.',
        });

        return id;
      });

      return await this.readService.getResearchDetail(researchId);
    } catch (error) {
      await this.cleanupUnreferencedUploads(allUploads);

      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'One or more uploaded files have already been submitted.',
        );
      }
      throw error;
    }
  }

  getById(id: string): Promise<ResearchDetail> {
    return this.readService.getResearchDetail(id);
  }

  private async resolveAttachments(
    dto: CreateResearchDto,
    primaryUpload: StoredUpload,
  ): Promise<StoredUpload[]> {
    const attachments = dto.attachments ?? [];
    const seen = new Set<string>([primaryUpload.uploadId]);
    const uploads: StoredUpload[] = [];

    for (const attachment of attachments) {
      if (seen.has(attachment.uploadId)) {
        throw new BadRequestException(
          'The same upload cannot be used more than once in a submission.',
        );
      }
      seen.add(attachment.uploadId);

      const upload = await this.storage.getUpload(attachment.uploadId);
      if (upload.category === 'primary_report') {
        throw new BadRequestException(
          'Additional attachments cannot use the primary_report category.',
        );
      }
      if (upload.category !== attachment.category) {
        throw new BadRequestException(
          'Attachment category does not match the uploaded file category.',
        );
      }
      uploads.push(upload);
    }

    return uploads;
  }

  private toResourceInsert(
    researchId: string,
    upload: StoredUpload,
    isPrimary: boolean,
  ) {
    return {
      researchId,
      originalFilename: upload.originalFilename,
      storageKey: upload.storageKey,
      fileCategory: upload.category,
      mimeType: upload.mimeType,
      fileSize: upload.fileSize,
      checksum: upload.checksum,
      isPrimary,
      uploadedAt: new Date(upload.uploadedAt),
    };
  }

  private async cleanupUnreferencedUploads(
    uploads: StoredUpload[],
  ): Promise<void> {
    for (const upload of uploads) {
      const [existing] = await this.db
        .select({ id: researchResources.id })
        .from(researchResources)
        .where(eq(researchResources.storageKey, upload.storageKey))
        .limit(1);

      if (!existing) {
        await this.storage.deleteUpload(upload.uploadId);
      }
    }
  }
}
