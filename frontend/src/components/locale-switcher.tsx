'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Common');
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: string) {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(href, { locale: nextLocale });
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink/70">
      <span className="sr-only">{t('language')}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value)}
        className="rounded-md border border-ink/15 bg-white px-2 py-1.5 text-xs font-semibold text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {item === 'bn' ? t('bangla') : t('english')}
          </option>
        ))}
      </select>
    </label>
  );
}
