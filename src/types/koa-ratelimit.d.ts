declare module 'koa-ratelimit' {
  import type { Context, Middleware } from 'koa';

  interface RateLimitOptions {
    driver?: string;
    db?: Map<string, unknown>;
    duration?: number;
    max?: number;
    id?: (ctx: Context) => string;
    errorMessage?: string;
    disableHeader?: boolean;
    onLimited?: (ctx: Context) => void;
  }

  function ratelimit(options: RateLimitOptions): Middleware;
  export default ratelimit;
}
