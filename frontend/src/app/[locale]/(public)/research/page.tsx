import { getLocale, getTranslations } from 'next-intl/server';
import { fetchPublicResearch, fetchReferenceOptions } from '@/lib/api/research';
import { ApiError } from '@/lib/api/errors';
import { Container } from '@/components/ui/container';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { ResearchSummaryCard } from '@/components/research-summary-card';
import { Field, Input, Select } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;

export default async function ResearchCataloguePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [t, locale, raw] = await Promise.all([
    getTranslations('Catalogue'),
    getLocale(),
    searchParams,
  ]);
  const page = Math.max(1, Number(one(raw.page)) || 1);
  const query = {
    page,
    limit: 12,
    search: one(raw.search),
    domainId: one(raw.domainId),
    studyTypeId: one(raw.studyTypeId),
    fundingSourceId: one(raw.fundingSourceId),
    locationId: one(raw.locationId),
    year: Number(one(raw.year)) || undefined,
  };
  const [researchResult, optionsResult] = await Promise.allSettled([
    fetchPublicResearch(query),
    fetchReferenceOptions(),
  ]);
  if (researchResult.status === 'rejected') {
    const error = researchResult.reason;
    if (!(error instanceof ApiError)) throw error;
    return (
      <Container className="py-12">
        <Alert variant="error" title={t('unavailableTitle')}>
          {t('unavailableBody')}
        </Alert>
      </Container>
    );
  }
  const options =
    optionsResult.status === 'fulfilled'
      ? optionsResult.value
      : { domains: [], studyTypes: [], fundingSources: [], locations: [] };
  const { data, meta } = researchResult.value;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw))
    if (typeof value === 'string' && value) params.set(key, value);
  const href = (nextPage: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    return `/research?${next}`;
  };
  const optionName = (item: { nameEn: string; nameBn: string }) =>
    locale === 'bn' ? item.nameBn : item.nameEn;

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
        {t('description')}
      </p>
      <form className="mt-8 grid gap-4 rounded-xl border border-ink/10 bg-white p-5 md:grid-cols-3">
        <Field id="search" label={t('searchLabel')} className="md:col-span-3">
          <Input
            id="search"
            name="search"
            defaultValue={query.search}
            placeholder={t('searchPlaceholder')}
          />
        </Field>
        <Field id="domain" label={t('domain')}>
          <Select
            id="domain"
            name="domainId"
            defaultValue={query.domainId ?? ''}
          >
            <option value="">{t('allDomains')}</option>
            {options.domains.map((x) => (
              <option key={x.id} value={x.id}>
                {optionName(x)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="studyType" label={t('studyType')}>
          <Select
            id="studyType"
            name="studyTypeId"
            defaultValue={query.studyTypeId ?? ''}
          >
            <option value="">{t('allStudyTypes')}</option>
            {options.studyTypes.map((x) => (
              <option key={x.id} value={x.id}>
                {optionName(x)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="funding" label={t('fundingSource')}>
          <Select
            id="funding"
            name="fundingSourceId"
            defaultValue={query.fundingSourceId ?? ''}
          >
            <option value="">{t('allFundingSources')}</option>
            {options.fundingSources.map((x) => (
              <option key={x.id} value={x.id}>
                {optionName(x)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="location" label={t('location')}>
          <Select
            id="location"
            name="locationId"
            defaultValue={query.locationId ?? ''}
          >
            <option value="">{t('allLocations')}</option>
            {options.locations.map((x) => (
              <option key={x.id} value={x.id}>
                {optionName(x)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="year" label={t('year')}>
          <Input
            id="year"
            name="year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            defaultValue={query.year}
            placeholder={t('yearPlaceholder')}
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit">{t('apply')}</Button>
        </div>
      </form>
      <p className="mt-7 text-sm font-semibold text-ink/70">
        {t('resultsCount', { count: meta.total })}
      </p>
      {data.length ? (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.map((research) => (
              <ResearchSummaryCard
                key={research.id}
                research={research}
                locale={locale}
              />
            ))}
          </div>
          <Pagination
            className="mt-8"
            page={meta.page}
            totalPages={meta.totalPages}
            buildHref={href}
          />
        </>
      ) : (
        <div className="mt-5">
          <EmptyState
            title={t('noResultsTitle')}
            description={t('noResultsBody')}
          />
        </div>
      )}
    </Container>
  );
}
