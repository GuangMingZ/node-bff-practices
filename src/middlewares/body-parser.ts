import koaBodyParser from 'koa-bodyparser';
import type { Middleware } from 'koa';

export const bodyParser = koaBodyParser() as Middleware;
