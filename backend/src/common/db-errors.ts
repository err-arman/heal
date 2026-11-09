export function isUniqueViolation(error: unknown): boolean {
  return hasPostgresCode(error, '23505');
}

function hasPostgresCode(error: unknown, code: string): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== 'object' || current === null) {
      return false;
    }

    if ('code' in current && (current as { code?: unknown }).code === code) {
      return true;
    }

    if (!('cause' in current)) {
      return false;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}
