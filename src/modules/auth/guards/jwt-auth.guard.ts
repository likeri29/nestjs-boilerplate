import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from 'modules/auth/constants/auth.const';
import { TokenService } from 'modules/auth/token.service';
import type { AuthenticatedRequest } from 'modules/auth/types/authenticated-request.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractBearerToken(request);

    if (!accessToken) throw new UnauthorizedException('Missing access token');

    const payload = await this.tokenService.verifyAccessToken(accessToken);

    (request as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

    return scheme === 'Bearer' && token ? token : undefined;
  }
}
