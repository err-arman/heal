import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';

export function SiteFooter() {
  const t = useTranslations('Nav');
  const home = useTranslations('Home');

  return (
    <footer className="mt-16 border-t border-ink/10 bg-white/60">
      <Container className="flex flex-col gap-4 py-8 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold tracking-[0.08em] text-ink">HEAL</p>
          <p className="mt-1 max-w-md leading-6">{home('eyebrow')}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/research" className="hover:text-brand-800">
            {t('research')}
          </Link>
          <Link href="/submit" className="hover:text-brand-800">
            {t('submit')}
          </Link>
          <Link href="/admin" className="hover:text-brand-800">
            {t('admin')}
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
