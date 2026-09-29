import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

describe('RedisService (in-memory fallback)', () => {
  let redis: RedisService;

  beforeEach(async () => {
    const config = {
      get: (key: string) => (key === 'NODE_ENV' ? 'test' : undefined),
    } as unknown as ConfigService;
    redis = new RedisService(config);
    await redis.onModuleInit();
  });

  it('del() also clears counters, so attempt limits reset after a success', async () => {
    await redis.incrWithExpiry('attempts', 60);
    await redis.incrWithExpiry('attempts', 60);
    await redis.del('attempts');
    expect(await redis.incrWithExpiry('attempts', 60)).toBe(1);
  });

  it('del() still removes plain values', async () => {
    await redis.set('code', '123456', 60);
    expect(await redis.del('code')).toBe(1);
    expect(await redis.get('code')).toBeNull();
  });
});
