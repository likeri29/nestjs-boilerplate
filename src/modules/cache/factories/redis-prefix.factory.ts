import type { RedisPrefixes } from 'modules/cache/enums/redis-prefixes.enum';

export const redisPrefixFactory = (
  prefix: RedisPrefixes,
  name: string,
): string => `${prefix}:${name}`;
