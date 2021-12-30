import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from './role.decorator';

@Injectable() //middleware, guard 등 다른 곳에서 instance가 의존성 주입되어야 하는 것을 provider라고 하며 Injectable로 decorate
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext, // 현재 컨텍스트로, request의 컨텍스트이고 graphql컨텍스트가 아님
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (roles === undefined) {
      //role이 undefined 되있으면 public resolver(메타데이터 확인하지 않으면)
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext(); //graphql context로 바꿔야 함.
    const user = gqlContext['user'];
    if (!user) {
      return false; //guard
    }
    return roles.includes('Any') || roles.includes(user.role);
  }
}
