import type { Middleware } from 'koa';

export const hidePoweredBy: Middleware = async (ctx, next) => {
  await next();
  ctx.remove('X-Powered-By');
};
