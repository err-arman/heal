import { validateEnvironment } from './env.validation.js';

const baseConfig = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://heal:heal@127.0.0.1:5432/heal',
};

describe('validateEnvironment', () => {
  it('applies documented defaults', () => {
    expect(validateEnvironment(baseConfig)).toMatchObject({
      NODE_ENV: 'test',
      PORT: 3000,
      APP_NAME: 'HEAL API',
      APP_VERSION: '0.0.1',
      SWAGGER_ENABLED: true,
      DB_SSL: false,
      STORAGE_DIR: './storage',
      MAX_FILE_SIZE: 100 * 1024 * 1024,
    });
  });

  it('parses explicit values', () => {
    expect(
      validateEnvironment({
        ...baseConfig,
        PORT: '4000',
        DB_SSL: 'true',
        SWAGGER_ENABLED: 'false',
        STORAGE_DIR: '/tmp/heal-storage',
        MAX_FILE_SIZE: '1024',
      }),
    ).toMatchObject({
      PORT: 4000,
      DB_SSL: true,
      SWAGGER_ENABLED: false,
      STORAGE_DIR: '/tmp/heal-storage',
      MAX_FILE_SIZE: 1024,
    });
  });

  it('requires DATABASE_URL', () => {
    expect(() => validateEnvironment({})).toThrow('DATABASE_URL is required.');
  });

  it('rejects non-postgres database URLs', () => {
    expect(() =>
      validateEnvironment({
        ...baseConfig,
        DATABASE_URL: 'mysql://localhost/heal',
      }),
    ).toThrow('postgres or postgresql protocol');
  });

  it('rejects invalid ports and booleans', () => {
    expect(() => validateEnvironment({ ...baseConfig, PORT: '0' })).toThrow();
    expect(() =>
      validateEnvironment({ ...baseConfig, DB_SSL: 'sometimes' }),
    ).toThrow();
  });
});
