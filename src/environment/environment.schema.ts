import { randomBytes } from 'crypto';
import { z } from 'zod';

import { ZOD_MS_TYPE } from 'environment/constants/zod-ms-type.const';
import { ZOD_PORT_TYPE } from 'environment/constants/zod-port-type.const';
import { NodeEnv } from 'environment/environment.enum';

export const environmentSchema = z.object({
  PROJECT_NAME: z.string().default('NestBoilerplate'),
  NODE_ENV: z.enum(NodeEnv).default(NodeEnv.DEVELOPMENT),
  TZ: z.string().default('UTC'),
  PORT: ZOD_PORT_TYPE.default(3000),
  FRONTEND_URL: z.string(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: ZOD_PORT_TYPE.default(5432),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string().default('postgres'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: ZOD_PORT_TYPE.default(6379),
  REDIS_PASSWORD: z.string().default(''),
  SMTP_HOST: z.string(),
  SMTP_PORT: ZOD_PORT_TYPE,
  SMTP_SECURE: z.stringbool().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.email(),
  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_FORCE_PATH_STYLE: z.stringbool().default(false),
  JWT_SECRET: z.string().default(randomBytes(64).toString('hex')),
  JWT_ACCESS_TOKEN_EXPIRE_IN: ZOD_MS_TYPE.default('15m'),
  JWT_REFRESH_TOKEN_EXPIRE_IN: ZOD_MS_TYPE.default('15d'),
});
