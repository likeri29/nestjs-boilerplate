import type { OnApplicationBootstrap } from '@nestjs/common';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render, toPlainText } from '@react-email/components';
import type { Transporter } from 'nodemailer';

import type { Env } from 'environment/environment.type';
import { MAIL_TRANSPORTER } from 'modules/mail/constants/mail-transporter.const';
import type { SendMailOptions } from 'modules/mail/types/send-mail-options.type';

@Injectable()
export class MailService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MailService.name);

  private readonly sender: { name: string; address: string };

  constructor(
    @Inject(MAIL_TRANSPORTER) private readonly transporter: Transporter,
    configService: ConfigService<Env, true>,
  ) {
    this.sender = {
      name: configService.get('PROJECT_NAME', { infer: true }),
      address: configService.get('SMTP_FROM', { infer: true }),
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `SMTP connection failed, emails won't be sent: ${reason}`,
      );
    }
  }

  async send({
    subject,
    template,
    ...recipients
  }: SendMailOptions): Promise<void> {
    const html = await render(template);
    const text = toPlainText(html);

    try {
      await this.transporter.sendMail({
        from: this.sender,
        subject,
        html,
        text,
        ...recipients,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email', {
        cause: error,
      });
    }
  }
}
