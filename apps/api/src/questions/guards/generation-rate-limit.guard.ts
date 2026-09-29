import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload } from '../../auth/interfaces/auth.interfaces';

interface AuthenticatedRequest extends Request {
  user?: { id?: string; sub?: string };
}

/**
 * Property stamped onto the request with the Redis key this request was
 * charged against, so QuotaRefundInterceptor can give it back on failure.
 */
export const QUOTA_KEY_REQUEST_PROPERTY = '__generationQuotaKey';

@Injectable()
export class GenerationRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(GenerationRateLimitGuard.name);
  private readonly dailyQuota: number;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.dailyQuota = this.config.get<number>('DAILY_GENERATION_QUOTA') ?? 20;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();

    const studentId = request.user?.id ?? request.user?.sub;
    if (!studentId) {
      // Let JwtAuthGuard handle missing auth — this guard only enforces quota
      return true;
    }

    // ── Build Redis key: rate_limit:gen:{studentId}:{YYYY-MM-DD} (UTC) ──
    const todayUtc = new Date().toISOString().slice(0, 10); // e.g. "2026-08-24"
    const redisKey = `rate_limit:gen:${studentId}:${todayUtc}`;

    // ── Compute TTL until midnight UTC ────────────────────────────
    const now = new Date();
    const midnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const ttlSeconds = Math.ceil((midnight.getTime() - now.getTime()) / 1000);

    // ── Atomic increment via Lua script in RedisService ───────────
    // incrWithExpiry sets TTL only on first INCR, preventing race conditions
    const currentCount = await this.redis.incrWithExpiry(redisKey, ttlSeconds);

    // Record what we charged so a failed request can be refunded.
    (request as unknown as Record<string, string>)[
      QUOTA_KEY_REQUEST_PROPERTY
    ] = redisKey;

    // ── Inject rate-limit headers into every response ─────────────
    response.setHeader('X-RateLimit-Limit', this.dailyQuota);
    response.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, this.dailyQuota - currentCount),
    );
    response.setHeader('X-RateLimit-Reset', midnight.toISOString());

    // ── Enforce quota ─────────────────────────────────────────────
    if (currentCount > this.dailyQuota) {
      this.logger.warn(
        `Student ${studentId} exceeded daily quota (${currentCount}/${this.dailyQuota})`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            'Daily AI question generation quota exceeded. Quota resets at midnight UTC.',
          quotaLimit: this.dailyQuota,
          resetAt: midnight.toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
