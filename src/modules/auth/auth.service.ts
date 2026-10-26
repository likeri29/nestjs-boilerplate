import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

import type { User } from 'database/entities/user.entity';
import type { Env } from 'environment/environment.type';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from 'modules/auth/constants/auth.const';
import { AccessTokenResponseDto } from 'modules/auth/dto/access-token-response.dto';
import { TokenService } from 'modules/auth/token.service';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class AuthService {
  private readonly isDevelopment: boolean;

  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    configService: ConfigService<Env, true>,
  ) {
    this.isDevelopment = configService.get('isDevelopment', { infer: true });
  }

  /**
   * The single entry point for every login method (password, magic link,
   * OTP, OAuth...): once a method has verified who the user is, call this to
   * start a session. Sets the refresh cookie and returns the access token.
   */
  async issueTokensForUser(
    user: User,
    response: Response,
  ): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshToken } =
      await this.tokenService.issueTokens(user);

    this.setRefreshTokenCookie(response, refreshToken);

    return new AccessTokenResponseDto(accessToken);
  }

  async refresh(
    refreshToken: string | undefined,
    response: Response,
  ): Promise<AccessTokenResponseDto> {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user) throw new UnauthorizedException('User no longer exists');

      const tokens = await this.tokenService.issueTokens(user, payload.sid);

      this.setRefreshTokenCookie(response, tokens.refreshToken);

      return new AccessTokenResponseDto(tokens.accessToken);
    } catch (error) {
      this.clearRefreshTokenCookie(response);
      throw error;
    }
  }

  async logout(
    refreshToken: string | undefined,
    response: Response,
  ): Promise<void> {
    this.clearRefreshTokenCookie(response);

    if (!refreshToken) return;

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      await this.tokenService.revokeSession(payload.sid);
    } catch {
      // Already invalid, nothing left to revoke.
    }
  }

  async logoutAll(userId: string, response: Response): Promise<void> {
    this.clearRefreshTokenCookie(response);
    await this.tokenService.revokeAllSessions(userId);
  }

  private get refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: !this.isDevelopment,
      // Cross-site frontends (different domain) need SameSite=None + Secure.
      sameSite: this.isDevelopment ? 'lax' : 'none',
      path: REFRESH_TOKEN_COOKIE_PATH,
    };
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...this.refreshCookieOptions,
      maxAge: this.tokenService.refreshTokenTtlMs,
    });
  }

  private clearRefreshTokenCookie(response: Response): void {
    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, this.refreshCookieOptions);
  }
}
