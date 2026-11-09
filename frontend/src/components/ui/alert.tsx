import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type AlertVariant = 'info' | 'warning' | 'error' | 'success';

const variantStyles: Record<AlertVariant, string> = {
  info: 'border-brand-200 bg-brand-50 text-brand-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm leading-6',
        variantStyles[variant],
        className,
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-1' : undefined}>{children}</div>
    </div>
  );
}
