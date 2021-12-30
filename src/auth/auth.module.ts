import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD, //전역으로 만들었지만 메타데이터가 없으면 작동하지 않음
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
