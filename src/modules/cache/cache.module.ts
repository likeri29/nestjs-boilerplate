import KeyvRedis from '@keyv/redis';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';

import { Env } from 'environment/environment.type';
import { CacheService } from 'modules/cache/cache.service';
import { CACHE_INSTANCE_NAME } from 'modules/cache/constants/cache-instance-name.const';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_INSTANCE_NAME,
      useFactory: (configService: ConfigService<Env, true>): Cacheable => {
        const host = configService.get('REDIS_HOST', { infer: true });
        const port = configService.get('REDIS_PORT', { infer: true });
        const password = configService.get('REDIS_PASSWORD', { infer: true });
        const secondary = new KeyvRedis(`redis://:${password}@${host}:${port}`);

        return new Cacheable({ secondary });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
