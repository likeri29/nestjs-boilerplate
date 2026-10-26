import type { TokenType } from 'modules/auth/enums/token-type.enum';

type BaseTokenPayload = {
  sub: string;
  sid: string;
  iat?: number;
  exp?: number;
};

export type AccessTokenPayload = BaseTokenPayload & {
  type: TokenType.ACCESS;
  email: string;
};

export type RefreshTokenPayload = BaseTokenPayload & {
  type: TokenType.REFRESH;
  jti: string;
};

export type RefreshSession = {
  userId: string;
  refreshTokenId: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
