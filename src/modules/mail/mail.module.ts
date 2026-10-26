import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import { createTransport } from 'nodemailer';

import type { Env } from 'environment/environment.type';
import { MAIL_TRANSPORTER } from 'modules/mail/constants/mail-transporter.const';
import { MailService } from 'modules/mail/mail.service';

@Global()
@Module({
  providers: [
    {
      provide: MAIL_TRANSPORTER,
      useFactory: (configService: ConfigService<Env, true>): Transporter => {
        const host = configService.get('SMTP_HOST', { infer: true });
        const port = configService.get('SMTP_PORT', { infer: true });
        const isSecure =
          configService.get('SMTP_SECURE', { infer: true }) ?? port === 465;
        const user = configService.get('SMTP_USER', { infer: true });
        const pass = configService.get('SMTP_PASSWORD', { infer: true });

        return createTransport({
          host,
          port,
          secure: isSecure,
          auth: user && pass ? { user, pass } : undefined,
        });
      },
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
