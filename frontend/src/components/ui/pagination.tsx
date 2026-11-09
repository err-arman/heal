import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { buttonStyles } from './button';

export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  const t = useTranslations('Common');

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t('pagination')}
      className={cn('flex items-center justify-between gap-3', className)}
    >
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        >
          {t('previous')}
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={buttonStyles({
            variant: 'secondary',
            size: 'sm',
            className: 'pointer-events-none opacity-50',
          })}
        >
          {t('previous')}
        </span>
      )}
      <span className="text-sm text-ink/65">
        {t('pageOf', { page, total: totalPages })}
      </span>
      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        >
          {t('next')}
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={buttonStyles({
            variant: 'secondary',
            size: 'sm',
            className: 'pointer-events-none opacity-50',
          })}
        >
          {t('next')}
        </span>
      )}
    </nav>
  );
}
