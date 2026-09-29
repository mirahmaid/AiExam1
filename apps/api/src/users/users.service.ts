import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface SafeUserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  branchId: string | null;
  branch: {
    id: string;
    name: string;
    createdAt: Date;
  } | null;
  twoFactorEnabled: boolean;
  /** Unused 2FA recovery codes left (0 when 2FA is off) */
  recoveryCodesRemaining: number;
  /** false for accounts created with Google that never set a password */
  hasPassword: boolean;
  emailVerified: boolean;
  oauthProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async updateProfile(
    userId: string,
    data: { name: string },
  ): Promise<SafeUserProfile> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name: data.name.trim() },
    });
    // The JWT strategy caches the user; drop it so the new name shows at once
    await this.redis.invalidateUserCache(userId);
    return this.getProfile(userId);
  }

  async getProfile(userId: string): Promise<SafeUserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { branch: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Explicit DTO whitelisting: NEVER return passwordHash, twoFactorSecret, twoFactorRecoveryCodes, or oauthProviderId
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      branchId: user.branchId,
      branch: user.branch
        ? {
            id: user.branch.id,
            name: user.branch.name,
            createdAt: user.branch.createdAt,
          }
        : null,
      twoFactorEnabled: user.twoFactorEnabled,
      recoveryCodesRemaining: user.twoFactorEnabled
        ? (user.twoFactorRecoveryCodes ?? []).length
        : 0,
      hasPassword: Boolean(user.passwordHash),
      emailVerified: user.emailVerified,
      oauthProvider: user.oauthProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
