import { randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { Env } from 'environment/environment.type';
import { TokenType } from 'modules/auth/enums/token-type.enum';
import type {
  AccessTokenPayload,
  AuthTokens,
  RefreshSession,
  RefreshTokenPayload,
} from 'modules/auth/types/token-payload.type';
import { CacheService } from 'modules/cache/cache.service';
import { RedisPrefixes } from 'modules/cache/enums/redis-prefixes.enum';
import { redisPrefixFactory } from 'modules/cache/factories/redis-prefix.factory';

type TokenOwner = { id: string; email: string };

@Injectable()
export class TokenService {
  readonly accessTokenTtlMs: number;

  readonly refreshTokenTtlMs: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    configService: ConfigService<Env, true>,
  ) {
    this.accessTokenTtlMs = configService.get('JWT_ACCESS_TOKEN_EXPIRE_IN', {
      infer: true,
    });
    this.refreshTokenTtlMs = configService.get('JWT_REFRESH_TOKEN_EXPIRE_IN', {
      infer: true,
    });
  }

  /**
   * Signs a new access + refresh token pair. Pass an existing `sessionId` to
   * rotate tokens within a session; omit it to start a new session (login).
   */
  async issueTokens(
    owner: TokenOwner,
    sessionId: string = randomUUID(),
  ): Promise<AuthTokens> {
    const refreshTokenId = randomUUID();

    const accessPayload: AccessTokenPayload = {
      type: TokenType.ACCESS,
      sub: owner.id,
      sid: sessionId,
      email: owner.email,
    };
    const refreshPayload: RefreshTokenPayload = {
      type: TokenType.REFRESH,
      sub: owner.id,
      sid: sessionId,
      jti: refreshTokenId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        expiresIn: this.toSeconds(this.accessTokenTtlMs),
      }),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.toSeconds(this.refreshTokenTtlMs),
      }),
    ]);

    const session: RefreshSession = { userId: owner.id, refreshTokenId };

    await this.cacheService.setShared(
      this.sessionKey(sessionId),
      session,
      this.refreshTokenTtlMs,
    );

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.verify(token);

    if (payload.type !== TokenType.ACCESS) {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload as AccessTokenPayload;
  }

  /**
   * Checks a refresh token against its stored session. A valid but already
   * used token means it was stolen or replayed, so the whole session is
   * revoked.
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const verifiedPayload = await this.verify(token);

    if (verifiedPayload.type !== TokenType.REFRESH) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = verifiedPayload as RefreshTokenPayload;

    const revokedBefore = await this.cacheService.getShared<number>(
      this.revokedBeforeKey(payload.sub),
    );

    if (revokedBefore && (payload.iat ?? 0) * 1000 <= revokedBefore) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const session = await this.cacheService.getShared<RefreshSession>(
      this.sessionKey(payload.sid),
    );

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Session has expired');
    }

    if (session.refreshTokenId !== payload.jti) {
      await this.revokeSession(payload.sid);
      throw new UnauthorizedException('Refresh token has already been used');
    }

    return payload;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.cacheService.deleteShared(this.sessionKey(sessionId));
  }

  /** Invalidates every refresh token the user currently holds. */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.cacheService.setShared(
      this.revokedBeforeKey(userId),
      Date.now(),
      this.refreshTokenTtlMs,
    );
  }

  private async verify(token: string): Promise<Record<string, unknown>> {
    try {
      return await this.jwtService.verifyAsync<Record<string, unknown>>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', {
        cause: error,
      });
    }
  }

  private toSeconds(milliseconds: number): number {
    return Math.floor(milliseconds / 1000);
  }

  private sessionKey(sessionId: string): string {
    return redisPrefixFactory(RedisPrefixes.REFRESH_TOKEN_SESSION, sessionId);
  }

  private revokedBeforeKey(userId: string): string {
    return redisPrefixFactory(RedisPrefixes.SESSIONS_REVOKED_BEFORE, userId);
  }
}
