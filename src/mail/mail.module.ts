import { DynamicModule, Global, Module } from '@nestjs/common';
import { MailModuleOption } from './mail.interface';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(options: MailModuleOption): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
