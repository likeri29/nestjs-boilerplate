import type { Request } from 'express';

import type { AuthUser } from 'modules/auth/types/auth-user.type';

export type AuthenticatedRequest = Request & { user: AuthUser };
