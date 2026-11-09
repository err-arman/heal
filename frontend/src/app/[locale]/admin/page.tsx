import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Alert } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/badge';
import { RESEARCH_STATUSES } from '@/lib/api/types';
import { fetchDashboardStats } from '@/lib/api/research';
import { ApiError } from '@/lib/api/errors';

export default async function AdminOverviewPage() {
  const t = await getTranslations('Admin');
  let stats = null;
  try {
    stats = await fetchDashboardStats();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <Container className="py-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          {t('overview')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          {t('overviewSubtitle')}
        </p>
      </div>
      {stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-ink/65">{t('total')}</p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </Card>
          {RESEARCH_STATUSES.map((status) => (
            <Card key={status} className="p-5">
              <StatusBadge status={status} />
              <p className="mt-3 text-2xl font-black">
                {stats.byStatus[status]}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Alert className="mt-6" variant="error" title={t('unavailableTitle')}>
          {t('unavailableBody')}
        </Alert>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-base font-bold text-ink">{t('overview')}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            {t('overviewSubtitle')}
          </p>
          <Link
            href="/admin"
            className={buttonStyles({
              variant: 'secondary',
              size: 'sm',
              className: 'mt-5',
            })}
          >
            {t('overview')}
          </Link>
        </Card>
        <Card className="p-6">
          <h3 className="text-base font-bold text-ink">{t('submissions')}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            {t('submissionsSubtitle')}
          </p>
          <Link
            href="/admin/submissions"
            className={buttonStyles({ size: 'sm', className: 'mt-5' })}
          >
            {t('submissions')}
          </Link>
        </Card>
      </div>
    </Container>
  );
}
