import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { fetchDashboardResearchDetail } from '@/lib/api/research';
import { ApiError } from '@/lib/api/errors';
import { formatDate, formatFileSize } from '@/lib/utils/format';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { ReviewActions } from '@/components/review-actions';

export default async function AdminSubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, locale, t, reviewT, researchT] = await Promise.all([
    params,
    getLocale(),
    getTranslations('Admin'),
    getTranslations('Review'),
    getTranslations('Research'),
  ]);
  let research;
  try {
    research = await fetchDashboardResearchDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <Container className="py-8">
        <Alert variant="error" title={t('unavailableTitle')}>
          {t('unavailableBody')}
        </Alert>
      </Container>
    );
  }
  const content =
    research.translations[locale === 'bn' ? 'bn' : 'en'] ??
    research.translations.en ??
    research.translations.bn;
  return (
    <Container className="py-8">
      <Link
        href="/admin/submissions"
        className="text-sm font-semibold text-brand-800 hover:underline"
      >
        ← {t('backToSubmissions')}
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            {research.submittingOrganizationName}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{content?.title}</h2>
        </div>
        <StatusBadge status={research.status} />
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold">{t('metadata')}</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <Detail
                label={researchT('year')}
                value={String(research.researchYear)}
              />
              <Detail
                label={researchT('studyType')}
                value={research.studyType.nameEn}
              />
              <Detail
                label={researchT('fundingSource')}
                value={research.fundingSource.nameEn}
              />
              <Detail
                label={researchT('location')}
                value={research.studyLocation.nameEn}
              />
              <Detail
                label={researchT('domains')}
                value={research.domains.map((x) => x.nameEn).join(', ')}
              />
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold">{researchT('authors')}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {research.authors.map((author) => (
                <li key={author.id ?? author.name}>
                  <strong>{author.name}</strong>
                  {author.affiliation ? ` — ${author.affiliation}` : ''}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold">{t('files')}</h3>
            {research.resources.map((resource) => (
              <div
                className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-ink/10 p-3"
                key={resource.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {resource.originalFilename}
                  </p>
                  <p className="text-xs text-ink/55">
                    {formatFileSize(resource.fileSize, locale)}
                  </p>
                </div>
                <a
                  className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                  href={`/api/backend/dashboard/resources/${resource.id}/download`}
                >
                  {t('download')}
                </a>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <h3 className="font-bold">{t('history')}</h3>
            <ol className="mt-3 space-y-3 text-sm">
              {research.statusHistory.map((item) => (
                <li key={item.id}>
                  <p className="font-semibold">
                    {item.newStatus.replace('_', ' ')}
                  </p>
                  <p className="text-ink/60">
                    {formatDate(item.changedAt, locale)}
                    {item.comment ? ` — ${item.comment}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <aside>
          <Card className="p-5">
            <h3 className="font-bold">{reviewT('title')}</h3>
            <p className="mt-1 text-sm text-ink/65">{reviewT('description')}</p>
            <div className="mt-5">
              <ReviewActions id={research.id} status={research.status} />
            </div>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-ink/55">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
