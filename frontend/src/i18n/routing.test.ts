import { describe, expect, it } from 'vitest';
import { routing } from './routing';

describe('routing', () => {
  it('supports English and Bangla', () => {
    expect(routing.locales).toEqual(['en', 'bn']);
  });

  it('defaults to English with an explicit locale prefix', () => {
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('always');
  });
});
