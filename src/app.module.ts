import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from 'app.service';

import { dataSourceOptions } from 'database/data-source-options';
import { environmentValidator } from 'environment/environment.validator';
import { CacheModule } from 'modules/cache/cache.module';
import { MailModule } from 'modules/mail/mail.module';
import { StorageModule } from 'modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: environmentValidator, isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule,
    MailModule,
    StorageModule,
  ],
  providers: [AppService],
})
export class AppModule {}
