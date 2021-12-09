import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx).getContext(); //request를 graphql context로 변경 (resolver에서 쓰기 위해)
    const user = gqlContext['user'];
    return user;
  },
);
