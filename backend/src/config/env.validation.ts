export type NodeEnvironment = 'development' | 'test' | 'production';

export interface EnvironmentVariables {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  APP_NAME: string;
  APP_VERSION: string;
  SWAGGER_ENABLED: boolean;
  DATABASE_URL: string;
  DB_SSL: boolean;
  STORAGE_DIR: string;
  MAX_FILE_SIZE: number;
}

const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

const NODE_ENVIRONMENTS: readonly NodeEnvironment[] = [
  'development',
  'test',
  'production',
];

function readString(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

function parsePort(value: string | undefined): number {
  if (value === undefined) {
    return 3000;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${value}".`);
  }
  return port;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }
  throw new Error(`Expected a boolean value, got "${value}".`);
}

function parsePositiveInteger(
  value: string | undefined,
  key: string,
  fallback: number,
): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${key} must be a positive integer, got "${value}".`);
  }
  return parsed;
}

function parseNodeEnvironment(value: string | undefined): NodeEnvironment {
  if (value === undefined) {
    return 'development';
  }
  if (!NODE_ENVIRONMENTS.includes(value as NodeEnvironment)) {
    throw new Error(
      `NODE_ENV must be one of ${NODE_ENVIRONMENTS.join(', ')}, got "${value}".`,
    );
  }
  return value as NodeEnvironment;
}

function parseDatabaseUrl(value: string | undefined): string {
  if (value === undefined) {
    throw new Error('DATABASE_URL is required.');
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL.');
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol.');
  }
  return value;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return {
    NODE_ENV: parseNodeEnvironment(readString(config, 'NODE_ENV')),
    PORT: parsePort(readString(config, 'PORT')),
    APP_NAME: readString(config, 'APP_NAME') ?? 'HEAL API',
    APP_VERSION: readString(config, 'APP_VERSION') ?? '0.0.1',
    SWAGGER_ENABLED: parseBoolean(
      readString(config, 'SWAGGER_ENABLED'),
      true,
    ),
    DATABASE_URL: parseDatabaseUrl(readString(config, 'DATABASE_URL')),
    DB_SSL: parseBoolean(readString(config, 'DB_SSL'), false),
    STORAGE_DIR: readString(config, 'STORAGE_DIR') ?? './storage',
    MAX_FILE_SIZE: parsePositiveInteger(
      readString(config, 'MAX_FILE_SIZE'),
      'MAX_FILE_SIZE',
      DEFAULT_MAX_FILE_SIZE,
    ),
  };
}
