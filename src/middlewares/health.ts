import type { Middleware } from 'koa';

export function health(): Middleware {
  return async (ctx, next) => {
    if (ctx.path === '/_health') {
      ctx.body = { ok: true };
      return;
    }
    await next();
  };
}
