import Koa from 'koa';

import { bodyParser } from './middlewares/body-parser.js';
import { clientInit } from './middlewares/client-init.js';
import { errorHandler } from './middlewares/error-handler.js';
import { hidePoweredBy } from './middlewares/hide-powered-by.js';
import { httpContext } from './middlewares/http-context.js';
import { ping } from './middlewares/ping.js';
import {
  clientIPLimit,
  clientQuidLimit,
  globalLimit,
} from './middlewares/rate-limit/index.js';
import { serverTiming } from './middlewares/server-timing.js';
import { setSimpleClient } from './middlewares/set-simple-client.js';

/**
 * 中间件顺序即架构契约。
 *
 * 1. setSimpleClient 必须在限流之前 → 提供 cip/quid
 * 2. 三层限流在 errorHandler 之前 → 尽早拒绝异常流量
 * 3. errorHandler 包裹后续中间件 → 统一异常响应
 * 4. serverTiming 在 clientInit 之前 → clientInit 可写入分段指标
 * 5. clientInit 在 bodyParser/httpContext 之前 → 建立 AsyncLocalStorage 上下文
 */
export function createServer(): Koa {
  const app = new Koa();

  app.use(hidePoweredBy);
  app.use(ping());

  app.use(setSimpleClient);
  app.use(clientIPLimit);
  app.use(clientQuidLimit);
  app.use(globalLimit);

  app.use(errorHandler);
  app.use(serverTiming);
  app.use(clientInit);

  app.use(bodyParser);
  app.use(httpContext);

  return app;
}
