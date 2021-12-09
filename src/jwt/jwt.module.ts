import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModuleOptions } from './jwt.interfaces';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { GraphQLModule } from '@nestjs/graphql';
import { CONFIG_OPTIONS } from '../common/common.constants';

@Global()
@Module({})
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    //dynamic module is a module that return another module
    return {
      module: JwtModule,
      imports: [TypeOrmModule.forFeature([User])],
      exports: [JwtService],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
    };
  }
}
