/**
 * 观察模式限流检查，算法对齐 koa-ratelimit memory driver。
 * 参考: https://github.com/koajs/ratelimit/blob/master/limiter/memory.js
 */

export interface RateLimitEntry {
  id: string;
  reset: number;
  remaining: number;
  total: number;
}

export interface RateLimitCheckResult {
  entry: RateLimitEntry;
  isLimited: boolean;
}

const timeBase = Date.now() * 1e3;
const hrtimeStart = process.hrtime();

function getMicrotime(): number {
  const diff = process.hrtime(hrtimeStart);
  return timeBase + diff[0] * 1e6 + Math.round(diff[1] * 1e-3);
}

export function checkRateLimit(
  id: string,
  config: { interval: number; max: number },
  store: Map<string, RateLimitEntry>,
): RateLimitCheckResult {
  const key = `limit:${id}`;
  const now = getMicrotime();
  const reset = now + config.interval * 1e3;

  let entry = store.get(key);
  const expired = entry !== undefined && entry.reset * 1e6 < now;
  const shouldReInit = !entry || expired;

  if (shouldReInit) {
    entry = {
      id,
      reset: reset / 1e6,
      remaining: config.max,
      total: config.max,
    };
    store.set(key, entry);
    entry.remaining = entry.remaining > 0 ? entry.remaining - 1 : 0;
    return { entry, isLimited: false };
  }

  const current = entry!;
  const isLimited = current.remaining <= 0;
  if (!isLimited) {
    current.remaining = current.remaining > 0 ? current.remaining - 1 : 0;
  }

  return { entry: current, isLimited };
}
