import { Inject, Injectable } from '@nestjs/common';
import { Cacheable } from 'cacheable';

import { CACHE_INSTANCE_NAME } from 'modules/cache/constants/cache-instance-name.const';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_INSTANCE_NAME) private readonly cache: Cacheable) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async set(
    key: string,
    value: unknown,
    ttl: number | string = '24h',
  ): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
