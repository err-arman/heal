import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { ReferenceDataSeedService } from './../src/modules/reference-data/reference-data-seed.service.js';

interface ReferenceItem {
  id: string;
  nameEn: string;
  nameBn: string;
}

interface ReferenceOptions {
  domains: ReferenceItem[];
  studyTypes: ReferenceItem[];
  fundingSources: ReferenceItem[];
  locations: ReferenceItem[];
}

interface UploadResponse {
  uploadId: string;
  storageKey: string;
  originalFilename: string;
  fileSize: number;
  checksum: string;
  category: string;
}

interface ResearchResponse {
  id: string;
  status: string;
  translations: {
    en: { title: string };
    bn: { title: string };
  };
  authors: Array<{ name: string; authorOrder: number }>;
  domains: ReferenceItem[];
  primaryResource: { id: string } | null;
  resources: Array<{
    id: string;
    originalFilename: string;
    fileCategory: string;
    isPrimary: boolean;
    downloadUrl?: string;
  }>;
  review: { decision: string; comments: string } | null;
  statusHistory: Array<{ newStatus: string }>;
}

const PDF_CONTENT = `%PDF-1.4
1 0 obj
<< /Type /Catalog >>
endobj
trailer
<< /Root 1 0 R >>
%%EOF
`;

describe('HEAL workflow (e2e)', () => {
  let app: INestApplication<App>;
  let options: ReferenceOptions;
  let researchId: string;
  let primaryUploadId: string;
  let primaryResourceId: string;
  let attachmentResourceId: string;
  let rejectedResearchId: string;

  const unique = `${Date.now()}`;
  const titleEn = `E2E maternal health study ${unique}`;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    await app.get(ReferenceDataSeedService).seed();

    const response = await request(app.getHttpServer())
      .get('/reference-data/options')
      .expect(200);
    options = response.body as ReferenceOptions;
  });

  afterAll(async () => {
    await app.close();
  });

  function server() {
    return request(app.getHttpServer());
  }

  async function upload(
    filename: string,
    content: string,
    category: string,
    contentType = 'application/pdf',
  ): Promise<UploadResponse> {
    const response = await server()
      .post('/resources/uploads')
      .field('category', category)
      .attach('file', Buffer.from(content), { filename, contentType })
      .expect(201);
    return response.body as UploadResponse;
  }

  function createPayload(
    primaryUploadId: string,
    overrides: Record<string, unknown> = {},
  ) {
    return {
      submittingOrganizationName: 'E2E Research Institute',
      researchYear: 2025,
      studyTypeId: options.studyTypes[0].id,
      fundingSourceId: options.fundingSources[0].id,
      studyLocationId: options.locations[1].id,
      translations: {
        en: {
          title: titleEn,
          abstract:
            'An end-to-end study of maternal health service utilisation in rural Bangladesh.',
          description:
            'This end-to-end study examines maternal health service utilisation and its associated factors in rural Bangladesh.',
          keywords: ['maternal health', 'Bangladesh', 'e2e'],
        },
        bn: {
          title: `ই২ই মাতৃস্বাস্থ্য গবেষণা ${unique}`,
          abstract:
            'গ্রামীণ বাংলাদেশে মাতৃস্বাস্থ্যসেবার ব্যবহার নিয়ে একটি ই২ই গবেষণা।',
          description:
            'এই ই২ই গবেষণায় গ্রামীণ বাংলাদেশে মাতৃস্বাস্থ্যসেবার ব্যবহার ও সংশ্লিষ্ট বিষয়গুলো পর্যালোচনা করা হয়েছে।',
          keywords: ['মাতৃস্বাস্থ্য', 'বাংলাদেশ', 'ই২ই'],
        },
      },
      authors: [
        { name: 'Dr. E2E Author', affiliation: 'E2E Institute' },
        { name: 'Second E2E Author' },
      ],
      domainIds: [options.domains[0].id, options.domains[7].id],
      primaryReport: { uploadId: primaryUploadId },
      ...overrides,
    };
  }

  it('provides seeded reference options', () => {
    expect(options.domains.length).toBeGreaterThan(0);
    expect(options.studyTypes.length).toBeGreaterThan(0);
    expect(options.fundingSources.length).toBeGreaterThan(0);
    expect(options.locations.length).toBeGreaterThan(0);
  });

  it('rejects an upload whose category does not match the primary report', async () => {
    const imageUpload = await upload('image.png', PDF_CONTENT, 'image', 'image/png');

    await server()
      .post('/research')
      .send(createPayload(imageUpload.uploadId))
      .expect(400);
  });

  it('rejects an incomplete submission', async () => {
    const primary = await upload('primary.pdf', PDF_CONTENT, 'primary_report');

    await server()
      .post('/research')
      .send(
        createPayload(primary.uploadId, {
          authors: [],
        }),
      )
      .expect(400);
  });

  it('creates a complete submission with one primary report and one attachment', async () => {
    const primary = await upload('primary.pdf', PDF_CONTENT, 'primary_report');
    const attachment = await upload(
      'data.csv',
      'district,cases\nDhaka,10\n',
      'spreadsheet',
      'text/csv',
    );
    primaryUploadId = primary.uploadId;

    const response = await server()
      .post('/research')
      .send(
        createPayload(primary.uploadId, {
          attachments: [
            { uploadId: attachment.uploadId, category: 'spreadsheet' },
          ],
        }),
      )
      .expect(201);

    const body = response.body as ResearchResponse;
    researchId = body.id;

    expect(body.status).toBe('submitted');
    expect(body.translations.en.title).toBe(titleEn);
    expect(body.authors.map((author) => author.authorOrder)).toEqual([1, 2]);
    expect(body.domains).toHaveLength(2);
    expect(body.resources).toHaveLength(2);

    primaryResourceId =
      body.resources.find((resource) => resource.isPrimary)?.id ?? '';
    attachmentResourceId =
      body.resources.find((resource) => !resource.isPrimary)?.id ?? '';

    expect(primaryResourceId).not.toBe('');
    expect(attachmentResourceId).not.toBe('');

    const detail = await server()
      .get(`/dashboard/research/${researchId}`)
      .expect(200);
    const history = (detail.body as ResearchResponse).statusHistory;
    expect(history.map((entry) => entry.newStatus)).toEqual(['submitted']);
  });

  it('rejects reuse of the same upload and preserves the existing file', async () => {
    await server()
      .post('/research')
      .send(createPayload(primaryUploadId))
      .expect(409);

    await server()
      .get(`/dashboard/resources/${primaryResourceId}/download`)
      .expect(200);
  });

  it('lists submissions and returns status statistics', async () => {
    const list = await server()
      .get('/dashboard/research?page=1&limit=50')
      .expect(200);
    const ids = (list.body.data as ResearchResponse[]).map((item) => item.id);
    expect(ids).toContain(researchId);

    const filtered = await server()
      .get(`/dashboard/research?status=submitted&search=${encodeURIComponent(titleEn)}`)
      .expect(200);
    expect(
      (filtered.body.data as ResearchResponse[]).some(
        (item) => item.id === researchId,
      ),
    ).toBe(true);

    const stats = await server().get('/dashboard/stats').expect(200);
    expect(stats.body.total).toBeGreaterThanOrEqual(1);
    expect(stats.body.byStatus.submitted).toBeGreaterThanOrEqual(1);
  });

  it('downloads dashboard attachments before publication', async () => {
    const response = await server()
      .get(`/dashboard/resources/${attachmentResourceId}/download`)
      .expect(200);
    expect(response.headers['content-disposition']).toContain('data.csv');
  });

  it('hides unpublished research from public endpoints', async () => {
    await server().get(`/public/research/${researchId}`).expect(404);
    await server()
      .get(
        `/public/research/${researchId}/resources/${attachmentResourceId}/download`,
      )
      .expect(404);
  });

  it('moves submitted research to under review once', async () => {
    const response = await server()
      .post(`/dashboard/research/${researchId}/under-review`)
      .expect(201);
    expect((response.body as ResearchResponse).status).toBe('under_review');

    await server()
      .post(`/dashboard/research/${researchId}/under-review`)
      .expect(409);
  });

  it('prevents publication before approval', async () => {
    await server()
      .post(`/dashboard/research/${researchId}/publish`)
      .expect(409);
  });

  it('records an approval, blocks duplicate reviews, and publishes', async () => {
    const review = await server()
      .post(`/dashboard/research/${researchId}/review`)
      .send({
        decision: 'approved',
        comments: 'Approved for the public catalogue.',
      })
      .expect(201);
    expect((review.body as ResearchResponse).status).toBe('approved');

    await server()
      .post(`/dashboard/research/${researchId}/review`)
      .send({
        decision: 'rejected',
        comments: 'Duplicate decision attempt.',
      })
      .expect(409);

    const published = await server()
      .post(`/dashboard/research/${researchId}/publish`)
      .expect(201);
    expect((published.body as ResearchResponse).status).toBe('published');

    await server()
      .post(`/dashboard/research/${researchId}/publish`)
      .expect(409);
  });

  it('serves published research through search, filters, detail, and download', async () => {
    const search = await server()
      .get(`/public/research?search=${encodeURIComponent(titleEn)}`)
      .expect(200);
    expect(
      (search.body.data as ResearchResponse[]).some(
        (item) => item.id === researchId,
      ),
    ).toBe(true);

    const filters = new URLSearchParams({
      domainId: options.domains[0].id,
      studyTypeId: options.studyTypes[0].id,
      fundingSourceId: options.fundingSources[0].id,
      locationId: options.locations[1].id,
      year: '2025',
    });
    const filtered = await server()
      .get(`/public/research?${filters.toString()}`)
      .expect(200);
    expect(
      (filtered.body.data as ResearchResponse[]).some(
        (item) => item.id === researchId,
      ),
    ).toBe(true);

    const noMatch = await server()
      .get('/public/research?year=1901')
      .expect(200);
    expect(
      (noMatch.body.data as ResearchResponse[]).some(
        (item) => item.id === researchId,
      ),
    ).toBe(false);

    const detail = await server()
      .get(`/public/research/${researchId}`)
      .expect(200);
    const detailBody = detail.body as ResearchResponse;
    expect(detailBody.resources).toHaveLength(2);
    expect(
      detailBody.resources.every((resource) => resource.downloadUrl),
    ).toBe(true);

    const download = await server()
      .get(
        `/public/research/${researchId}/resources/${primaryResourceId}/download`,
      )
      .expect(200);
    expect(download.headers['content-disposition']).toContain('primary.pdf');
  });

  it('keeps rejected research unpublished and inaccessible publicly', async () => {
    const primary = await upload(
      'rejected-primary.pdf',
      PDF_CONTENT,
      'primary_report',
    );

    const created = await server()
      .post('/research')
      .send(
        createPayload(primary.uploadId, {
          translations: {
            en: {
              title: `E2E rejected study ${unique}`,
              abstract:
                'A study submitted specifically to verify the rejection workflow.',
              description:
                'This submission exists solely to verify that rejected research cannot be published.',
              keywords: ['rejection', 'e2e'],
            },
            bn: {
              title: `ই২ই প্রত্যাখ্যাত গবেষণা ${unique}`,
              abstract:
                'প্রত্যাখ্যান কার্যপ্রবাহ যাচাই করার জন্য জমা দেওয়া একটি গবেষণা।',
              description:
                'প্রত্যাখ্যাত গবেষণা প্রকাশ করা যায় না তা যাচাই করার জন্য এই জমা।',
              keywords: ['প্রত্যাখ্যান', 'ই২ই'],
            },
          },
          authors: [{ name: 'Rejected E2E Author' }],
          domainIds: [options.domains[1].id],
        }),
      )
      .expect(201);

    rejectedResearchId = (created.body as ResearchResponse).id;

    await server()
      .post(`/dashboard/research/${rejectedResearchId}/under-review`)
      .expect(201);

    const rejected = await server()
      .post(`/dashboard/research/${rejectedResearchId}/review`)
      .send({
        decision: 'rejected',
        comments: 'Insufficient methodological detail.',
      })
      .expect(201);
    expect((rejected.body as ResearchResponse).status).toBe('rejected');

    await server()
      .post(`/dashboard/research/${rejectedResearchId}/publish`)
      .expect(409);
    await server()
      .get(`/public/research/${rejectedResearchId}`)
      .expect(404);

    const search = await server()
      .get(`/public/research?search=${encodeURIComponent(`E2E rejected study ${unique}`)}`)
      .expect(200);
    expect(
      (search.body.data as ResearchResponse[]).some(
        (item) => item.id === rejectedResearchId,
      ),
    ).toBe(false);
  });

  it('validates pagination bounds', async () => {
    await server().get('/dashboard/research?limit=500').expect(400);
    await server().get('/public/research?page=0').expect(400);
  });
});
