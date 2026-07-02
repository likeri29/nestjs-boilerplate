import type { z } from 'zod';

import type { environmentSchema } from 'environment/environment.schema';

export type Env = z.infer<typeof environmentSchema> & {
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
};
