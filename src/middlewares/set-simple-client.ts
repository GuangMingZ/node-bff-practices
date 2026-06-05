import type { Middleware } from 'koa';

/**
 * 必须在限流中间件之前执行。
 * 限流依赖 ctx.cip / ctx.quid 作为 key，顺序错了会导致限流失效。
 */
export const setSimpleClient: Middleware = async (ctx, next) => {
  const forwarded = ctx.request.get('x-forwarded-for');
  const cip = forwarded?.split(',')[0]?.trim() || ctx.ip || 'unknown';
  const quid = ctx.cookies.get('user_uid') || 'anonymous';

  ctx.cip = cip;
  ctx.quid = quid;

  await next();
};
