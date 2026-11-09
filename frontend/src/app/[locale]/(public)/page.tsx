import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const nav = await getTranslations('Nav');

  const features = [
    {
      title: t('howAuthors'),
      body: t('howAuthorsBody'),
    },
    {
      title: t('howFiles'),
      body: t('howFilesBody'),
    },
    {
      title: t('howBilingual'),
      body: t('howBilingualBody'),
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-gradient-to-br from-brand-50 via-paper to-sand">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[40px] border-brand-200/50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-24 size-72 rounded-full bg-brand-100/60 blur-3xl"
        />
        <Container className="relative py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.2em] text-brand-700 uppercase">
              {t('eyebrow')}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-ink/70 sm:text-lg">
              {t('description')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/research"
                className={buttonStyles({ size: 'md', className: 'px-5 py-3' })}
              >
                {t('browse')}
              </Link>
              <Link
                href="/submit"
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'md',
                  className: 'px-5 py-3',
                })}
              >
                {t('submit')}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <SectionHeading
          eyebrow={nav('research')}
          title={t('howTitle')}
          description={t('howDescription')}
          action={
            <Link
              href="/research"
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            >
              {nav('research')}
            </Link>
          }
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={feature.title} className="p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-black text-brand-800">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                {feature.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
}
