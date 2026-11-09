import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SkipLink } from '@/components/ui/skip-link';

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('Common');

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink>{t('skipToContent')}</SkipLink>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
