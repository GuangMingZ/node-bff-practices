import Router from '@koa/router';
import type Koa from 'koa';

import { getAsyncStore } from '../lib/async-context.js';
import { configStore, RateLimitType } from '../lib/config-store.js';
import { logger } from '../lib/logger.js';

export function setupRoutes(app: Koa): void {
  const router = new Router();

  router.get('/', async ctx => {
    ctx.body = {
      message: 'Node BFF Practices Demo',
      topics: [
        'middleware order design',
        'AsyncLocalStorage request context',
        'three-layer rate limit observation mode',
      ],
      endpoints: {
        health: 'GET /_health',
        echo: 'GET /api/echo',
        profile: 'GET /api/profile',
        rateLimitConfig: 'GET /admin/rate-limit',
        updateRateLimit: 'PATCH /admin/rate-limit/:type',
      },
    };
  });

  router.get('/api/echo', async ctx => {
    ctx.body = {
      reqId: ctx.reqId,
      seqId: ctx.seqId,
      cip: ctx.cip,
      quid: ctx.quid,
      message: 'echo ok',
    };
  });

  router.get('/api/profile', async ctx => {
    ctx.serverTime.startTime('4_business');
    await new Promise(resolve => setTimeout(resolve, 30));
    ctx.serverTime.endTime('4_business');

    const store = getAsyncStore();
    logger.info({
      event: 'deep-call-log',
      brief: '深层调用通过 AsyncLocalStorage 读取 reqId',
    });

    const lifeInfo = store?.lifeInfo;
    ctx.body = {
      fromCtx: {
        reqId: ctx.reqId,
        seqId: ctx.seqId,
        cip: ctx.cip,
        quid: ctx.quid,
      },
      fromAsyncStore: lifeInfo
        ? {
            ...lifeInfo,
            startTime: lifeInfo.startTime.toString(),
          }
        : null,
    };
  });

  router.get('/admin/rate-limit', async ctx => {
    ctx.body = configStore.getAllRateLimits();
  });

  router.patch('/admin/rate-limit/:type', async ctx => {
    const type = ctx.params.type as RateLimitType;
    if (!Object.values(RateLimitType).includes(type)) {
      ctx.status = 400;
      ctx.body = { message: `invalid type, expected one of ${Object.values(RateLimitType).join(', ')}` };
      return;
    }

    const body = (ctx.request.body ?? {}) as {
      rateLimitMax?: number;
      rateLimitInterval?: number;
      disable?: boolean;
      rateLimitMessage?: string;
    };

    configStore.updateRateLimit(type, body);

    logger.info({
      event: 'rate-limit-config-updated',
      limitBy: type,
      config: configStore.getRateLimit(type),
    });

    ctx.body = {
      message: 'updated',
      type,
      config: configStore.getRateLimit(type),
    };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}
