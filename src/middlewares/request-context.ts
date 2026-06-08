import type { Middleware } from 'koa';

import { getAsyncStore } from '../lib/async-context.js';
import { logger } from '../lib/logger.js';

/**
 * 请求生命周期日志。
 * 依赖 clientCtxInit 已建立 AsyncLocalStorage 上下文。
 */
export const requestContext: Middleware = async (ctx, next) => {
  const store = getAsyncStore();
  const start = store?.lifeInfo.startTime ?? process.hrtime.bigint();

  try {
    await next();
  } finally {
    const durationMs =
      Number(process.hrtime.bigint() - start) / 1e6;
    const isSuccess = ctx.status < 400;

    logger.info({
      event: 'client-response',
      brief: `${ctx.method} ${ctx.originalUrl} (succeed: ${isSuccess}, ${ctx.status})`,
      statusCode: ctx.status,
      durationMs: Number(durationMs.toFixed(2)),
    });
  }
};
