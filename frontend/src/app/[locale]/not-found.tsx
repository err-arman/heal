import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function NotFoundPage() {
  const t = useTranslations('NotFound');

  return (
    <main id="main-content" className="flex min-h-screen items-center py-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-black tracking-[0.2em] text-brand-700">
            404
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/65">
            {t('description')}
          </p>
          <Link
            href="/"
            className={buttonStyles({ className: 'mt-7', size: 'md' })}
          >
            {t('backHome')}
          </Link>
        </div>
      </Container>
    </main>
  );
}
