import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data && request.user) {
      return request.user[data as keyof typeof request.user];
    }
    return request.user;
  },
);
