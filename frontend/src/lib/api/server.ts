import { backendApiUrl } from '@/lib/config/env';
import { ApiError, apiErrorFromResponse } from './errors';

const REQUEST_TIMEOUT_MS = 20_000;

export async function serverApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(backendApiUrl(path), {
      ...init,
      cache: init.cache ?? 'no-store',
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ApiError({
      message:
        error instanceof Error
          ? error.message
          : 'Could not reach the research service.',
      status: null,
      kind: 'network',
    });
  }

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
