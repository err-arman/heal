import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SiteNav } from '@/components/site-nav';
import { Container } from '@/components/ui/container';

export function SiteHeader() {
  const t = useTranslations('Home');

  return (
    <header className="border-b border-ink/10 bg-paper/90 backdrop-blur">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-800 text-sm font-black tracking-tight text-white shadow-sm">
            H
          </span>
          <span>
            <span className="block text-lg font-black tracking-[0.08em] text-ink">
              HEAL
            </span>
            <span className="block text-[11px] leading-4 text-ink/55">
              {t('eyebrow')}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteNav />
          <LocaleSwitcher />
        </div>
      </Container>
    </header>
  );
}
