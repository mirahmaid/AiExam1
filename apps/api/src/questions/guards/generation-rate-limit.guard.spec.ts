import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerationRateLimitGuard } from './generation-rate-limit.guard';
import { RedisService } from '../../redis/redis.service';

const mockRedis = {
  incrWithExpiry: jest.fn(),
  get: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'DAILY_GENERATION_QUOTA') return 20;
    return undefined;
  }),
};

function buildMockContext(
  studentId: string | null,
  responseHeaders: Record<string, string | number> = {},
): ExecutionContext {
  const setHeader = jest.fn((key: string, value: string | number) => {
    responseHeaders[key] = value;
  });

  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: studentId ? { sub: studentId, email: 'test@test.com' } : undefined,
      }),
      getResponse: () => ({ setHeader }),
    }),
  } as unknown as ExecutionContext;
}

describe('GenerationRateLimitGuard', () => {
  let guard: GenerationRateLimitGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerationRateLimitGuard,
        { provide: RedisService, useValue: mockRedis },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    guard = module.get<GenerationRateLimitGuard>(GenerationRateLimitGuard);
    jest.clearAllMocks();
  });

  it('should pass through when no user is authenticated (let JwtAuthGuard handle)', async () => {
    const ctx = buildMockContext(null);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockRedis.incrWithExpiry).not.toHaveBeenCalled();
  });

  it('should allow requests within daily quota', async () => {
    mockRedis.incrWithExpiry.mockResolvedValue(5); // 5th request, quota is 20
    const headers: Record<string, string | number> = {};
    const ctx = buildMockContext('student-1', headers);

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockRedis.incrWithExpiry).toHaveBeenCalledWith(
      expect.stringContaining('rate_limit:gen:student-1:'),
      expect.any(Number),
    );
    expect(headers['X-RateLimit-Limit']).toBe(20);
    expect(headers['X-RateLimit-Remaining']).toBe(15); // 20 - 5
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('should throw HTTP 429 when quota is exceeded', async () => {
    mockRedis.incrWithExpiry.mockResolvedValue(21); // 21st request
    const ctx = buildMockContext('student-1');

    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('should include structured payload in 429 response', async () => {
    mockRedis.incrWithExpiry.mockResolvedValue(25); // well over quota
    const ctx = buildMockContext('student-2');

    try {
      await guard.canActivate(ctx);
      fail('Expected HttpException to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const response = (err as HttpException).getResponse() as Record<string, unknown>;
      expect(response.statusCode).toBe(429);
      expect(response.message).toContain('quota exceeded');
      expect(response.quotaLimit).toBe(20);
      expect(response.resetAt).toBeDefined();
    }
  });

  it('should use atomic Redis key per student per day', async () => {
    mockRedis.incrWithExpiry.mockResolvedValue(1);
    const ctx = buildMockContext('student-abc');

    await guard.canActivate(ctx);

    const today = new Date().toISOString().slice(0, 10);
    expect(mockRedis.incrWithExpiry).toHaveBeenCalledWith(
      `rate_limit:gen:student-abc:${today}`,
      expect.any(Number),
    );
  });

  it('should set X-RateLimit-Remaining to 0 when at quota limit', async () => {
    mockRedis.incrWithExpiry.mockResolvedValue(20); // exactly at limit, still allowed
    const headers: Record<string, string | number> = {};
    const ctx = buildMockContext('student-1', headers);

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(headers['X-RateLimit-Remaining']).toBe(0);
  });
});
