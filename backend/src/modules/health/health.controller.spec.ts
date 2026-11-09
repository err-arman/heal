import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService, type HealthStatus } from './health.service.js';

describe('HealthController', () => {
  it('delegates the health check to HealthService', async () => {
    const result: HealthStatus = {
      status: 'ok',
      database: 'up',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const healthService = { check: vi.fn().mockResolvedValue(result) };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    const controller = moduleRef.get(HealthController);

    await expect(controller.check()).resolves.toBe(result);
    expect(healthService.check).toHaveBeenCalledOnce();
  });
});
