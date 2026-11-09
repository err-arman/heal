import type { ApiErrorPayload } from './types';

export type ApiFailureKind =
  | 'network'
  | 'validation'
  | 'conflict'
  | 'notFound'
  | 'unauthorized'
  | 'server'
  | 'generic';

export class ApiError extends Error {
  readonly status: number | null;
  readonly kind: ApiFailureKind;
  readonly messages: string[];

  constructor({
    message,
    status,
    kind,
    messages,
  }: {
    message: string;
    status: number | null;
    kind: ApiFailureKind;
    messages?: string[];
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.messages = messages ?? [message];
  }
}

export function kindForStatus(status: number): ApiFailureKind {
  if (status === 400 || status === 413 || status === 415) {
    return 'validation';
  }
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }
  if (status === 404) {
    return 'notFound';
  }
  if (status === 409) {
    return 'conflict';
  }
  if (status >= 500) {
    return 'server';
  }
  return 'generic';
}

export function apiErrorFromPayload(
  status: number,
  payload: unknown,
): ApiError {
  const body =
    payload && typeof payload === 'object'
      ? (payload as Partial<ApiErrorPayload>)
      : null;

  const messages = Array.isArray(body?.message)
    ? body.message.filter((item): item is string => typeof item === 'string')
    : typeof body?.message === 'string'
      ? [body.message]
      : [];

  const message =
    messages.length > 0
      ? messages.join(' ')
      : body?.error || `Request failed with status ${status}.`;

  return new ApiError({
    message,
    status,
    kind: kindForStatus(status),
    messages: messages.length > 0 ? messages : [message],
  });
}

export async function apiErrorFromResponse(
  response: Response,
): Promise<ApiError> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return apiErrorFromPayload(response.status, payload);
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      status: null,
      kind: 'network',
    });
  }

  return new ApiError({
    message: 'Unknown request error.',
    status: null,
    kind: 'generic',
  });
}

export function apiErrorMessageKey(error: unknown): string {
  const normalized = normalizeApiError(error);

  switch (normalized.kind) {
    case 'network':
      return 'network';
    case 'validation':
      return 'validation';
    case 'conflict':
      return 'conflict';
    case 'notFound':
      return 'notFound';
    case 'unauthorized':
      return 'unauthorized';
    case 'server':
      return 'server';
    default:
      return 'generic';
  }
}
