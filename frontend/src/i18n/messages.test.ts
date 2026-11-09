import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import bn from '../../messages/bn.json';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('messages', () => {
  it('has the same message keys in English and Bangla', () => {
    expect(flattenKeys(bn).sort()).toEqual(flattenKeys(en).sort());
  });
});
