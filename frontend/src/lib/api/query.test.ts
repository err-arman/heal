import { describe, expect, it } from 'vitest';
import { buildQuery } from './query';

describe('buildQuery', () => {
  it('omits empty values and encodes parameters', () => {
    expect(
      buildQuery({
        page: 2,
        limit: 10,
        search: 'maternal health',
        domainId: undefined,
        year: null,
      }),
    ).toBe('?page=2&limit=10&search=maternal+health');
  });

  it('returns an empty string when there are no values', () => {
    expect(buildQuery({ search: '', year: undefined })).toBe('');
  });
});
