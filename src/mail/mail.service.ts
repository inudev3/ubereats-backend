import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOption } from './mail.interface';
import * as FormData from 'form-data';
import got from 'got';
@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOption,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    to: string,
    emailVars: EmailVar,
  ) {
    const form = new FormData();
    form.append('from', `Inu from UberEats <mailgun@${this.options.domain}>`);
    form.append('to', `inust33@gmail.com`);
    form.append('subject', `${subject}`);
    form.append('template', `${template}`);

    Object.keys(emailVars).forEach((key) =>
      form.append(`v:${key}`, emailVars[key]),
    );

    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic$ ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
    } catch (e) {
      console.log(e);
    }
  }
  sendVerificationEmail(email: string, code: string, to: string) {
    this.sendEmail('Verify your Email', 'verify-email', `${to}`, {
      code: code,
      username: email,
    });
  }
}
