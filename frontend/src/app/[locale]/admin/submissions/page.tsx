import { getLocale, getTranslations } from 'next-intl/server';
import { fetchDashboardResearch } from '@/lib/api/research';
import { ApiError } from '@/lib/api/errors';
import { RESEARCH_STATUSES, type ResearchStatus } from '@/lib/api/types';
import { Container } from '@/components/ui/container';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/form';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { ResearchSummaryCard } from '@/components/research-summary-card';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;
export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [raw, locale, t, statusT, common] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations('Admin'),
    getTranslations('Status'),
    getTranslations('Common'),
  ]);
  const page = Math.max(1, Number(one(raw.page)) || 1);
  const requestedStatus = one(raw.status);
  const status = RESEARCH_STATUSES.includes(requestedStatus as ResearchStatus)
    ? (requestedStatus as ResearchStatus)
    : undefined;
  let result;
  try {
    result = await fetchDashboardResearch({
      page,
      limit: 20,
      search: one(raw.search),
      status,
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <Container className="py-8">
        <Alert variant="error" title={t('unavailableTitle')}>
          {t('unavailableBody')}
        </Alert>
      </Container>
    );
  }
  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (raw.search && typeof raw.search === 'string')
      params.set('search', raw.search);
    if (status) params.set('status', status);
    params.set('page', String(nextPage));
    return `/admin/submissions?${params}`;
  };
  return (
    <Container className="py-8">
      <h2 className="text-2xl font-bold">{t('submissions')}</h2>
      <p className="mt-2 text-sm text-ink/65">{t('submissionsSubtitle')}</p>
      <form className="mt-6 grid gap-4 rounded-xl border border-ink/10 bg-white p-4 sm:grid-cols-[1fr_14rem_auto]">
        <Field id="search" label={t('submissions')}>
          <Input
            id="search"
            name="search"
            defaultValue={one(raw.search)}
            placeholder={t('searchPlaceholder')}
          />
        </Field>
        <Field id="status" label={t('filterStatus')}>
          <Select id="status" name="status" defaultValue={status ?? ''}>
            <option value="">{t('filterAll')}</option>
            {RESEARCH_STATUSES.map((value) => (
              <option key={value} value={value}>
                {statusT(value)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit">{common('search')}</Button>
        </div>
      </form>
      {result.data.length ? (
        <>
          <div className="mt-6 grid gap-4">
            {result.data.map((research) => (
              <ResearchSummaryCard
                key={research.id}
                research={research}
                locale={locale}
                admin
              />
            ))}
          </div>
          <Pagination
            className="mt-8"
            page={result.meta.page}
            totalPages={result.meta.totalPages}
            buildHref={buildHref}
          />
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title={t('noSubmissions')}
            description={t('submissionsSubtitle')}
          />
        </div>
      )}
    </Container>
  );
}
