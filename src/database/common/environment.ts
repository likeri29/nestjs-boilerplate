import { config } from 'dotenv';
import { env } from 'process';

import { environmentValidator } from 'environment/environment.validator';

config();

export const environment = environmentValidator(env);
