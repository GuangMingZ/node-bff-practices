import type { Middleware } from 'koa';

/**
 * 必须在 clientInit 之前挂载。
 * clientInit 会向 ctx.serverTiming 写入 1_connect 等指标。
 */
export const serverTiming: Middleware = async (ctx, next) => {
  const metrics: Array<{ name: string; duration: number }> = [];
  const timers = new Map<string, { name: string; start: bigint }>();

  ctx.serverTiming = {
    add: metric => metrics.push(metric),
    startTime: name => {
      timers.set(name, { name, start: process.hrtime.bigint() });
    },
    endTime: name => {
      const timer = timers.get(name);
      if (!timer) return;
      const duration = Number(process.hrtime.bigint() - timer.start) / 1e6;
      metrics.push({ name: timer.name, duration });
      timers.delete(name);
    },
  };

  await next();

  const headerValue = metrics
    .map(({ name, duration }) => `${name};dur=${duration.toFixed(2)}`)
    .join(', ');

  if (headerValue) {
    ctx.set('server-timing', headerValue);
  }
};
