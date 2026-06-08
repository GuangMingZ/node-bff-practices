import Koa from 'koa';

import { bodyParser } from './middlewares/body-parser.js';
import { clientCtxInit } from './middlewares/client-ctx-init.js';
import { errorHandler } from './middlewares/error-handler.js';
import { extractClientId } from './middlewares/extract-client-id.js';
import { health } from './middlewares/health.js';
import { hidePoweredBy } from './middlewares/hide-powered-by.js';
import { requestContext } from './middlewares/request-context.js';
import {
  clientIPLimit,
  clientIdLimit,
  globalLimit,
} from './middlewares/rate-limit/index.js';
import { serverTime } from './middlewares/server-time.js';

/**
 * 中间件顺序即架构契约。
 *
 * 1. extractClientId 必须在限流之前 → 提供 cip/quid
 * 2. 三层限流在 errorHandler 之前 → 尽早拒绝异常流量
 * 3. errorHandler 包裹后续中间件 → 统一异常响应
 * 4. serverTime 在 clientCtxInit 之前 → clientCtxInit 可写入分段指标
 * 5. clientCtxInit 在 bodyParser/requestContext 之前 → 建立 AsyncLocalStorage 上下文
 */
export function createServer(): Koa {
  const app = new Koa();

  app.use(hidePoweredBy);
  app.use(health());

  app.use(extractClientId);
  app.use(clientIPLimit);
  app.use(clientIdLimit);
  app.use(globalLimit);

  app.use(errorHandler);
  app.use(serverTime);
  app.use(clientCtxInit);

  app.use(bodyParser);
  app.use(requestContext);

  return app;
}
