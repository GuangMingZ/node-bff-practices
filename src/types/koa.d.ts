import type { ServerTime } from '../common/context.js';

declare module 'koa' {
  interface DefaultContext {
    cip: string;
    quid: string;
    reqId: string;
    seqId: string;
    requestStartTime: bigint;
    serverTime: ServerTime;
  }
}
