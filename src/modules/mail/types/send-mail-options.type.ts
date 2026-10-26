import type { SendMailOptions as NodemailerSendMailOptions } from 'nodemailer';
import type { ReactElement } from 'react';

export type SendMailOptions = Pick<
  NodemailerSendMailOptions,
  'to' | 'cc' | 'bcc' | 'replyTo' | 'attachments'
> & {
  subject: string;
  template: ReactElement;
};
