import type { ServerTiming } from '../common/context.js';

declare module 'koa' {
  interface DefaultContext {
    cip: string;
    quid: string;
    reqId: string;
    seqId: string;
    requestStartTime: bigint;
    serverTiming: ServerTiming;
  }
}
