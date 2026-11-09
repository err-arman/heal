export function getBackendApiUrl(): string {
  const value = process.env.BACKEND_API_URL?.trim();

  if (!value) {
    throw new Error('BACKEND_API_URL is not configured');
  }

  return value.replace(/\/+$/, '');
}

export function backendApiUrl(path: string): string {
  return `${getBackendApiUrl()}/${path.replace(/^\/+/, '')}`;
}
