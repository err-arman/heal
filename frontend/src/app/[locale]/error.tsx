'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Errors');
  const common = useTranslations('Common');

  return (
    <main id="main-content" className="py-16">
      <Container>
        <Card className="mx-auto max-w-xl p-8 text-center">
          <p className="text-sm font-bold tracking-[0.16em] text-red-700 uppercase">
            HEAL
          </p>
          <h1 className="mt-3 text-2xl font-bold text-ink">
            {common('errorTitle')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            {t('generic')}
          </p>
          <Button onClick={reset} className="mt-6">
            {common('retry')}
          </Button>
        </Card>
      </Container>
    </main>
  );
}
