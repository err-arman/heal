import { Link } from '@/i18n/navigation';
import type { ResearchSummary } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format';
import { Card } from './ui/card';

export function ResearchSummaryCard({
  research,
  locale,
  admin = false,
}: {
  research: ResearchSummary;
  locale: string;
  admin?: boolean;
}) {
  const translation =
    research.translations[locale === 'bn' ? 'bn' : 'en'] ??
    research.translations.en ??
    research.translations.bn;
  const path = admin
    ? `/admin/submissions/${research.id}`
    : `/research/${research.id}`;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-brand-800">
            {research.submittingOrganizationName}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">
            <Link href={path} className="hover:text-brand-700 hover:underline">
              {translation?.title ?? research.submittingOrganizationName}
            </Link>
          </h3>
        </div>
        {admin ? (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
            {research.status.replace('_', ' ')}
          </span>
        ) : null}
      </div>
      {translation?.abstract ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">
          {translation.abstract}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/55">
        <span>{research.researchYear}</span>
        <span>{research.studyType.nameEn}</span>
        <span>
          {formatDate(research.publishedAt ?? research.submittedAt, locale)}
        </span>
      </div>
    </Card>
  );
}
