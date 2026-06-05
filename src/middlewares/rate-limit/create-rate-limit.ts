import type { Context, Middleware, Next } from 'koa';
import ratelimit from 'koa-ratelimit';

import { checkRateLimit } from '../../helpers/checkRateLimit.js';
import {
  configStore,
  type RateLimitConfig,
  RateLimitType,
} from '../../lib/config-store.js';
import { logger } from '../../lib/logger.js';
import { logRateLimitLifecycle } from '../../utils/rateLimitLogger.js';

interface CreateRateLimitOptions {
  type: RateLimitType;
  getId: (ctx: Context) => string;
}

export function createRateLimitMiddleware({
  type,
  getId,
}: CreateRateLimitOptions): Middleware {
  const rateLimitStore = new Map();
  const observationStore = new Map();

  return async (ctx, next: Next) => {
    if (ctx.method === 'OPTIONS') {
      return next();
    }

    const currentConfig = configStore.getRateLimit(type);
    const id = getId(ctx);

    if (currentConfig.disable) {
      const { isLimited } = checkRateLimit(
        id,
        {
          interval: currentConfig.rateLimitInterval,
          max: currentConfig.rateLimitMax,
        },
        observationStore,
      );

      if (isLimited) {
        logger.info({
          event: 'rate-limit-exceeded-observation',
          limitBy: type,
          id,
          message: `${ctx.method} ${ctx.originalUrl} - ${type} exceeded (observation mode)`,
          brief: `policy:l=${currentConfig.rateLimitMax};w=${currentConfig.rateLimitInterval / 1000}s`,
        });
      }

      return next();
    }

    const rateLimitMiddleware = ratelimit({
      driver: 'memory',
      db: rateLimitStore,
      duration: currentConfig.rateLimitInterval,
      max: currentConfig.rateLimitMax,
      id: () => id,
      errorMessage: currentConfig.rateLimitMessage,
      disableHeader: true,
      onLimited: (limitedCtx: Context) => {
        logger.error({
          event: 'rate-limit-exceeded',
          code: 429,
          limitBy: type,
          id,
          message: `${limitedCtx.method} ${limitedCtx.originalUrl}`,
          brief: `policy:l=${currentConfig.rateLimitMax};w=${currentConfig.rateLimitInterval / 1000}s`,
        });
        logRateLimitLifecycle(limitedCtx);
      },
    });

    await rateLimitMiddleware(ctx, next);
  };
}

export function getRateLimitSummary(config: RateLimitConfig): string {
  const mode = config.disable ? 'observation' : 'enforced';
  return `${config.rateLimitMax}/${config.rateLimitInterval}ms (${mode})`;
}
