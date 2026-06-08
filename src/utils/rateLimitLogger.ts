import type { ParameterizedContext } from 'koa';

import { logger } from '../lib/logger.js';

/**
 * 限流发生在 clientCtxInit 之前，正常生命周期日志不完整。
 * 触发限流时手动补全 client-init / client-response 事件。
 */
export function logRateLimitLifecycle(ctx: ParameterizedContext): void {
  const { request } = ctx;
  const method = request.method.toUpperCase();
  const url = request.originalUrl;

  logger.info({
    event: 'client-init',
    brief: `${method} ${url}`,
    method,
    url,
    note: '补全日志：限流发生在 clientCtxInit 之前',
  });

  logger.error({
    event: 'client-response',
    brief: `${method} ${url} (succeed: false, 429)`,
    statusCode: 429,
    message: 'Rate limit exceeded',
  });
}
