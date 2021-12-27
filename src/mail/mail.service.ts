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

  async sendEmail(
    //you can't test with private
    subject: string,
    template: string,
    to: string,
    emailVars: EmailVar,
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Inu from UberEats <mailgun@${this.options.domain}>`);
    form.append('to', `inust33@gmail.com`);
    form.append('subject', `${subject}`);
    form.append('template', `${template}`);

    Object.entries(emailVars).forEach(([key, val]) =>
      form.append(`v:${key}`, val),
    );

    try {
      const response = await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic$ ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (e) {
      // console.log(e); //you can't test console.log
      return false;
    }
  }
  sendVerificationEmail(email: string, code: string, to: string) {
    this.sendEmail('Verify your Email', 'verify-email', `${to}`, {
      code: code,
      username: email,
    });
  }
}
