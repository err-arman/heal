const DATE_LOCALES: Record<string, string> = {
  en: 'en-GB',
  bn: 'bn-BD',
};

export function formatDate(value: string | Date, locale: string): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(DATE_LOCALES[locale] ?? 'en-GB').format(value);
}

export function formatFileSize(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '';
  }

  if (bytes < 1024) {
    return `${formatNumber(bytes, locale)} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${new Intl.NumberFormat(DATE_LOCALES[locale] ?? 'en-GB', {
      maximumFractionDigits: 1,
    }).format(bytes / 1024)} KB`;
  }

  return `${new Intl.NumberFormat(DATE_LOCALES[locale] ?? 'en-GB', {
    maximumFractionDigits: 1,
  }).format(bytes / (1024 * 1024))} MB`;
}
