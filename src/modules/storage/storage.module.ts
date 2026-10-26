import { S3Client } from '@aws-sdk/client-s3';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from 'environment/environment.type';
import { S3_CLIENT } from 'modules/storage/constants/s3-client.const';
import { StorageService } from 'modules/storage/storage.service';

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      useFactory: (configService: ConfigService<Env, true>): S3Client =>
        new S3Client({
          region: configService.get('S3_REGION', { infer: true }),
          endpoint: configService.get('S3_ENDPOINT', { infer: true }),
          forcePathStyle: configService.get('S3_FORCE_PATH_STYLE', {
            infer: true,
          }),
          credentials: {
            accessKeyId: configService.get('S3_ACCESS_KEY_ID', { infer: true }),
            secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY', {
              infer: true,
            }),
          },
        }),
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
