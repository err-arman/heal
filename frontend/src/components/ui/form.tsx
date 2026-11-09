import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const controlClasses =
  'w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink shadow-sm placeholder:text-ink/45 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500';

export function Label({
  className,
  ...props
}: ComponentProps<'label'>) {
  return (
    <label
      className={cn('block text-sm font-semibold text-ink', className)}
      {...props}
    />
  );
}

export function FieldHint({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p id={id} className={cn('mt-1.5 text-xs leading-5 text-ink/60', className)}>
      {children}
    </p>
  );
}

export function FieldError({
  id,
  children,
  className,
}: {
  id?: string;
  children?: ReactNode;
  className?: string;
}) {
  if (!children) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={cn('mt-1.5 text-xs font-medium text-red-700', className)}
    >
      {children}
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? <FieldHint id={`${id}-hint`}>{hint}</FieldHint> : null}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  function Input({ className, ...props }, ref) {
    return (
      <input ref={ref} className={cn(controlClasses, className)} {...props} />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<'textarea'>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(controlClasses, 'min-h-28 resize-y', className)}
      {...props}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<'select'>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(controlClasses, 'pr-9', className)}
        {...props}
      />
    );
  },
);
