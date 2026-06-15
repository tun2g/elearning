import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { AppConfig } from 'src/config/configuration';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService<AppConfig, true>) {
    const mail = config.get('mail', { infer: true });
    this.from = mail.fromName ? `"${mail.fromName}" <${mail.from}>` : mail.from;
    this.transporter = mail.host
      ? nodemailer.createTransport({
          host: mail.host,
          port: mail.port,
          secure: mail.secure,
          auth: mail.username ? { user: mail.username, pass: mail.password } : undefined,
        })
      : null;
  }

  /** Sends an email. When SMTP is unconfigured (dev), logs the message instead. */
  async send(input: SendMailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured — email NOT sent to ${input.to}: "${input.subject}"`);
      this.logger.warn(`[dev email body]\n${input.text}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    this.logger.log(`Sent "${input.subject}" to ${input.to}`);
  }
}
