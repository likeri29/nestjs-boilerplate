import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from 'modules/auth/constants/auth.const';

export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_PUBLIC_KEY, true);
