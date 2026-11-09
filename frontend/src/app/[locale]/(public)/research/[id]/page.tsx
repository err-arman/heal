import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ApiError } from '@/lib/api/errors';
import { fetchPublicResearchDetail } from '@/lib/api/research';
import { formatDate, formatFileSize } from '@/lib/utils/format';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { buttonStyles } from '@/components/ui/button';

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, locale, t, common] = await Promise.all([
    params,
    getLocale(),
    getTranslations('Research'),
    getTranslations('Common'),
  ]);
  let research;
  try {
    research = await fetchPublicResearchDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <Container className="py-12">
        <Alert variant="error" title={t('notFound')}>
          {t('notFoundBody')}
        </Alert>
      </Container>
    );
  }
  const translation =
    research.translations[locale === 'bn' ? 'bn' : 'en'] ??
    research.translations.en ??
    research.translations.bn;
  const primary = research.resources.find((x) => x.isPrimary);
  const supporting = research.resources.filter((x) => !x.isPrimary);
  const download = (resourceId: string) =>
    `/api/backend/public/research/${research.id}/resources/${resourceId}/download`;
  const name = (item: { nameEn: string; nameBn: string }) =>
    locale === 'bn' ? item.nameBn : item.nameEn;
  return (
    <Container className="py-10 sm:py-14">
      <Link
        href="/research"
        className="text-sm font-semibold text-brand-800 hover:underline"
      >
        ← {t('backToCatalogue')}
      </Link>
      <div className="mt-6 max-w-4xl">
        <p className="text-sm font-semibold text-brand-700">
          {research.submittingOrganizationName}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
          {translation?.title}
        </h1>
        <p className="mt-4 text-sm text-ink/60">
          {t('publishedOn', {
            date: formatDate(
              research.publishedAt ?? research.submittedAt,
              locale,
            ),
          })}
        </p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold">{t('abstract')}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/70">
              {translation?.abstract}
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold">{t('description')}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/70">
              {translation?.description}
            </p>
            {translation?.keywords.length ? (
              <>
                <h3 className="mt-6 text-sm font-bold">{t('keywords')}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {translation.keywords.map((x) => (
                    <span
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-900"
                      key={x}
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold">{t('attachments')}</h2>
            {primary ? (
              <FileLink
                resource={primary}
                href={download(primary.id)}
                label={t('primaryReport')}
                action={common('download')}
                locale={locale}
              />
            ) : (
              <p className="mt-3 text-sm text-ink/65">{t('noPrimary')}</p>
            )}
            {supporting.length ? (
              <div className="mt-5 border-t border-ink/10 pt-4">
                <h3 className="text-sm font-bold">{t('supportingFiles')}</h3>
                {supporting.map((resource) => (
                  <FileLink
                    key={resource.id}
                    resource={resource}
                    href={download(resource.id)}
                    action={common('download')}
                    locale={locale}
                  />
                ))}
              </div>
            ) : null}
          </Card>
        </div>
        <aside>
          <Card className="p-5">
            <h2 className="font-bold">{t('overview')}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <Item label={t('year')} value={String(research.researchYear)} />
              <Item label={t('studyType')} value={name(research.studyType)} />
              <Item
                label={t('fundingSource')}
                value={name(research.fundingSource)}
              />
              <Item
                label={t('location')}
                value={name(research.studyLocation)}
              />
              <Item
                label={t('domains')}
                value={research.domains.map(name).join(', ')}
              />
            </dl>
          </Card>
          <Card className="mt-4 p-5">
            <h2 className="font-bold">{t('authors')}</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {research.authors.map((author) => (
                <li key={author.id ?? author.name}>
                  <p className="font-semibold">{author.name}</p>
                  {author.affiliation ? (
                    <p className="text-ink/60">{author.affiliation}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-ink/55">{label}</dt>
      <dd className="mt-1 text-ink/80">{value}</dd>
    </div>
  );
}
function FileLink({
  resource,
  href,
  label,
  action,
  locale,
}: {
  resource: { originalFilename: string; fileSize: number };
  href: string;
  label?: string;
  action: string;
  locale: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-ink/10 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {resource.originalFilename}
        </p>
        <p className="text-xs text-ink/55">
          {label ? `${label} · ` : ''}
          {formatFileSize(resource.fileSize, locale)}
        </p>
      </div>
      <a
        href={href}
        className={buttonStyles({ variant: 'secondary', size: 'sm' })}
      >
        {action}
      </a>
    </div>
  );
}
