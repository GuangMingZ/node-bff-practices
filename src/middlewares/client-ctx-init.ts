import { nanoid } from 'nanoid';
import type { Middleware } from 'koa';

import { runWithinAsyncStore } from '../lib/async-context.js';
import { logger } from '../lib/logger.js';

function createSeqId(): string {
  return crypto.randomUUID();
}

/**
 * 建立请求上下文，并通过 AsyncLocalStorage 让深层调用透明读取 reqId 等信息。
 * 必须在 requestBodyParser / requestContext 之前执行。
 */
export const clientCtxInit: Middleware = async (ctx, next) => {
  const reqId = nanoid();
  const seqId = createSeqId();
  const method = ctx.method.toUpperCase();
  const url = ctx.originalUrl;

  let lid: string | null = ctx.get('x-lid');
  if (typeof lid !== 'string' || lid.length > 12) {
    lid = null;
  }

  let life = Number(ctx.get('x-life'));
  if (Number.isNaN(life)) {
    life = 0;
  }

  const clientTimestamp = Number(ctx.query.t);
  const gatewayTimestamp = Number(ctx.get('x-gateway-time')) * 1000;

  if (!Number.isNaN(clientTimestamp) && !Number.isNaN(gatewayTimestamp)) {
    ctx.serverTime.add({
      name: '1_connect',
      duration: gatewayTimestamp - clientTimestamp,
    });
    ctx.serverTime.add({
      name: '2_gateway',
      duration: Date.now() - gatewayTimestamp,
    });
  }

  const startTime = process.hrtime.bigint();
  ctx.reqId = reqId;
  ctx.seqId = seqId;
  ctx.requestStartTime = startTime;
  ctx.set('x-req-id', reqId);
  ctx.set('x-seq-id', seqId);

  const lifeInfo = {
    reqId,
    seqId,
    lid,
    life,
    cip: ctx.cip,
    quid: ctx.quid,
    uin: ctx.cookies.get('uin') || '',
    method,
    url,
    startTime,
  };

  return runWithinAsyncStore({ lifeInfo }, async () => {
    logger.info({
      event: 'client-init',
      brief: `${method} ${url}`,
      method,
      url,
      lid,
      life,
    });

    await next();
  });
};
