import type { Middleware } from 'koa';

export function ping(): Middleware {
  return async (ctx, next) => {
    if (ctx.path === '/_ping') {
      ctx.body = { ok: true };
      return;
    }
    await next();
  };
}
