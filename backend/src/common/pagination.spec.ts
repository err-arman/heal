import { buildPageMeta } from './pagination.js';
import { escapeLike } from './query.utils.js';

describe('buildPageMeta', () => {
  it('calculates total pages', () => {
    expect(buildPageMeta(1, 20, 45)).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it('returns zero pages for empty results', () => {
    expect(buildPageMeta(1, 20, 0)).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });
});

describe('escapeLike', () => {
  it('escapes ILIKE wildcard characters', () => {
    expect(escapeLike('50%_off\\')).toBe('50\\%\\_off\\\\');
  });
});
