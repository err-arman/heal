import type {
  ReferenceItem,
  ResearchSummary,
  Translation,
} from '@/lib/api/types';

export function getLocaleKey(locale: string): 'en' | 'bn' {
  return locale === 'bn' ? 'bn' : 'en';
}

export function getTranslation(
  research: Pick<ResearchSummary, 'translations'>,
  locale: string,
): Translation | null {
  const key = getLocaleKey(locale);
  return research.translations[key] ?? research.translations.en;
}

export function getReferenceName(
  reference: Pick<ReferenceItem, 'nameEn' | 'nameBn'>,
  locale: string,
): string {
  return getLocaleKey(locale) === 'bn' ? reference.nameBn : reference.nameEn;
}

export function getDownloadHref(downloadUrl?: string): string | null {
  if (!downloadUrl) {
    return null;
  }

  return downloadUrl.startsWith('/')
    ? `/api/backend${downloadUrl}`
    : `/api/backend/${downloadUrl}`;
}

export function getDashboardDownloadHref(resourceId: string): string {
  return `/api/backend/dashboard/resources/${resourceId}/download`;
}
