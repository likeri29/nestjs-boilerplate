import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from 'modules/auth/types/auth-user.type';
import type { AuthenticatedRequest } from 'modules/auth/types/authenticated-request.type';

export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException(
        '@CurrentUser() used on a route without authentication',
      );
    }

    return field ? user[field] : user;
  },
);
