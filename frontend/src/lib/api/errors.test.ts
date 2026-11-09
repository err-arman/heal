import { describe, expect, it } from 'vitest';
import {
  ApiError,
  apiErrorFromPayload,
  apiErrorMessageKey,
  kindForStatus,
  normalizeApiError,
} from './errors';

describe('API errors', () => {
  it('maps status codes to failure kinds', () => {
    expect(kindForStatus(400)).toBe('validation');
    expect(kindForStatus(404)).toBe('notFound');
    expect(kindForStatus(409)).toBe('conflict');
    expect(kindForStatus(503)).toBe('server');
  });

  it('reads string and array validation messages', () => {
    const error = apiErrorFromPayload(400, {
      statusCode: 400,
      message: ['title must be longer', 'abstract is required'],
    });

    expect(error.kind).toBe('validation');
    expect(error.messages).toHaveLength(2);
    expect(error.message).toBe('title must be longer abstract is required');
  });

  it('normalizes unknown failures to the generic message key', () => {
    expect(apiErrorMessageKey(new Error('offline'))).toBe('network');
    expect(apiErrorMessageKey(new ApiError({
      message: 'conflict',
      status: 409,
      kind: 'conflict',
    }))).toBe('conflict');
    expect(apiErrorMessageKey(normalizeApiError({}))).toBe('generic');
  });
});
