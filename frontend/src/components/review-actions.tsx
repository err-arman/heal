'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  createResearchReview,
  moveResearchToUnderReview,
  publishResearch,
} from '@/lib/api/client';
import type { ResearchStatus } from '@/lib/api/types';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { Field, Select, Textarea } from './ui/form';

export function ReviewActions({
  id,
  status,
}: {
  id: string;
  status: ResearchStatus;
}) {
  const t = useTranslations('Review');
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch {
      setError(t('actionError'));
    } finally {
      setBusy(false);
    }
  }
  if (status === 'published')
    return <Alert variant="success">{t('publishedNotice')}</Alert>;
  if (status === 'rejected')
    return <Alert variant="warning">{t('rejectedNotice')}</Alert>;
  if (status === 'submitted')
    return (
      <div className="space-y-3">
        <Alert variant="info">{t('submittedNotice')}</Alert>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button
          disabled={busy}
          onClick={() => run(() => moveResearchToUnderReview(id))}
        >
          {busy ? t('processing') : t('moveToUnderReview')}
        </Button>
      </div>
    );
  if (status === 'approved')
    return (
      <div className="space-y-3">
        <Alert variant="info">{t('approvedNotice')}</Alert>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button disabled={busy} onClick={() => run(() => publishResearch(id))}>
          {busy ? t('publishing') : t('publish')}
        </Button>
      </div>
    );
  return (
    <div className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Field id="decision" label={t('decision')}>
        <Select
          id="decision"
          value={decision}
          onChange={(event) =>
            setDecision(event.target.value as 'approved' | 'rejected')
          }
        >
          <option value="approved">{t('approve')}</option>
          <option value="rejected">{t('reject')}</option>
        </Select>
      </Field>
      <Field id="comments" label={t('comments')} hint={t('commentsHint')}>
        <Textarea
          id="comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder={t('commentsPlaceholder')}
        />
      </Field>
      <Button
        disabled={busy || comments.trim().length < 2}
        onClick={() =>
          run(() =>
            createResearchReview(id, { decision, comments: comments.trim() }),
          )
        }
      >
        {busy ? t('processing') : t('recordDecision')}
      </Button>
    </div>
  );
}
