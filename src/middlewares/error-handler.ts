import type { Middleware } from 'koa';

import { logger } from '../lib/logger.js';

/**
 * 必须包裹后续业务中间件，才能统一捕获异常并返回 JSON。
 */
export const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    logger.error({
      event: 'app-error',
      brief: message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    ctx.status = 500;
    ctx.body = { message: '服务器繁忙，请重试', isBffError: true };
  }
};
