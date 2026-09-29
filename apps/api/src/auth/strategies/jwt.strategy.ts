import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { TokenRevocationService } from '../services/token-revocation.service';
import { DEV_JWT_SECRET } from '../constant/auth-messages';
import type { JwtPayload } from '../interfaces/auth.interfaces';

const USER_CACHE_TTL_SECONDS = 60;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private tokenRevocationService: TokenRevocationService,
    private redisService: RedisService,
  ) {
    const secret = config.get<string>('JWT_SECRET') ?? DEV_JWT_SECRET;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.['access_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<User> {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid session. Please log in again.');
    }

    const token =
      ExtractJwt.fromAuthHeaderAsBearerToken()(request) ||
      request.cookies?.['access_token'] ||
      null;

    // Check revocation and cache in parallel
    const [isRevoked, cached] = await Promise.all([
      token
        ? this.tokenRevocationService.isRevoked(token)
        : Promise.resolve(false),
      this.redisService.get(`jwt-user:${payload.sub}`),
    ]);

    if (isRevoked) {
      throw new UnauthorizedException(
        'Session has been terminated. Please log in again.',
      );
    }

    if (cached) {
      return JSON.parse(cached) as User;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid session. Please log in again.');
    }

    // Cache a safe subset — strip passwordHash, twoFactorSecret, and recoveryCodes
    const {
      passwordHash: _,
      twoFactorSecret: __,
      twoFactorRecoveryCodes: ___,
      ...safeUser
    } = user;

    await this.redisService.set(
      `jwt-user:${payload.sub}`,
      JSON.stringify(safeUser),
      USER_CACHE_TTL_SECONDS,
    );

    return safeUser as unknown as User;
  }
}
