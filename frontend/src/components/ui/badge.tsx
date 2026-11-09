import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { ResearchStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

const statusStyles: Record<ResearchStatus, string> = {
  submitted: 'border-sky-200 bg-sky-50 text-sky-800',
  under_review: 'border-amber-200 bg-amber-50 text-amber-900',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  published: 'border-brand-200 bg-brand-50 text-brand-800',
};

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: ResearchStatus;
  className?: string;
}) {
  const t = useTranslations('Status');

  return (
    <Badge className={cn(statusStyles[status], className)}>{t(status)}</Badge>
  );
}
