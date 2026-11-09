import { getLocale, getTranslations } from 'next-intl/server';
import { fetchReferenceOptions } from '@/lib/api/research';
import { Container } from '@/components/ui/container';
import { Alert } from '@/components/ui/alert';
import { SubmissionForm } from '@/components/submission-form';

export default async function SubmitPage() {
  const [locale, t, options] = await Promise.all([
    getLocale(),
    getTranslations('Submission'),
    fetchReferenceOptions().catch((error) => error),
  ]);
  if (options instanceof Error)
    return (
      <Container className="py-12">
        <Alert variant="error" title={t('submitErrorTitle')}>
          {t('submitErrorBody')}
        </Alert>
      </Container>
    );
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
        {t('description')}
      </p>
      <SubmissionForm options={options} locale={locale} />
    </Container>
  );
}
