import { ServiceUnavailableException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PG_POOL } from '../../database/database.constants.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;
  const pool = { query: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PG_POOL, useValue: pool }],
    }).compile();

    service = module.get(HealthService);
  });

  it('reports the database as up when the query succeeds', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    await expect(service.check()).resolves.toMatchObject({
      status: 'ok',
      database: 'up',
    });
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns a 503 when the database query fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'));

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
