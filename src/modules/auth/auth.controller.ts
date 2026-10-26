import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthService } from 'modules/auth/auth.service';
import { REFRESH_TOKEN_COOKIE_NAME } from 'modules/auth/constants/auth.const';
import { CurrentUser } from 'modules/auth/decorators/current-user.decorator';
import { Public } from 'modules/auth/decorators/public.decorator';
import { AccessTokenResponseDto } from 'modules/auth/dto/access-token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenResponseDto> {
    return this.authService.refresh(this.getRefreshToken(request), response);
  }

  @Public()
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(this.getRefreshToken(request), response);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logoutAll(userId, response);
  }

  private getRefreshToken(request: Request): string | undefined {
    const cookies = request.cookies as Record<string, string | undefined>;

    return cookies[REFRESH_TOKEN_COOKIE_NAME];
  }
}
