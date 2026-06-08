import { RateLimitType } from '../../lib/config-store.js';
import { createRateLimitMiddleware } from './create-rate-limit.js';

export const clientIPLimit = createRateLimitMiddleware({
  type: RateLimitType.Cip,
  getId: ctx => ctx.cip,
});

export const clientIdLimit = createRateLimitMiddleware({
  type: RateLimitType.Uid,
  getId: ctx => ctx.quid,
});

export const globalLimit = createRateLimitMiddleware({
  type: RateLimitType.Global,
  getId: () => 'global',
});
