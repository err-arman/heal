import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink/10 bg-white shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
