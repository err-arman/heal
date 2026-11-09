import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { AdminNav } from '@/components/admin/admin-nav';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Alert } from '@/components/ui/alert';
import { Container } from '@/components/ui/container';
import { SkipLink } from '@/components/ui/skip-link';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('Admin');
  const common = await getTranslations('Common');

  return (
    <div className="min-h-screen bg-sand/40">
      <SkipLink>{common('skipToContent')}</SkipLink>
      <header className="border-b border-ink/10 bg-ink text-white">
        <Container className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-brand-200 uppercase">
                HEAL
              </p>
              <h1 className="mt-1 text-xl font-bold">{t('title')}</h1>
            </div>
            <div className="rounded-lg bg-white/10 px-3 py-1.5">
              <div className="[&_label]:text-white/75">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <AdminNav />
          </div>
        </Container>
      </header>
      <main id="main-content" className="pb-16">
        <Container className="pt-5">
          <Alert variant="warning" title={t('title')}>
            {t('warning')}
          </Alert>
        </Container>
        {children}
      </main>
    </div>
  );
}
