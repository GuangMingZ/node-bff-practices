import { getAsyncStore } from './async-context.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  event: string;
  brief?: string;
  [key: string]: unknown;
}

function formatPayload(payload: LogPayload): string {
  const store = getAsyncStore();
  const reqId = store?.lifeInfo.reqId ?? '-';
  const quid = store?.lifeInfo.quid ?? '-';
  const cip = store?.lifeInfo.cip ?? '-';

  return JSON.stringify({
    reqId,
    quid,
    cip,
    ...payload,
  });
}

function log(level: LogLevel, payload: LogPayload): void {
  const line = formatPayload(payload);
  const writer = level === 'error' ? console.error : console.log;
  writer(`[${level}] ${line}`);
}

export const logger = {
  info: (payload: LogPayload) => log('info', payload),
  warn: (payload: LogPayload) => log('warn', payload),
  error: (payload: LogPayload) => log('error', payload),
  debug: (payload: LogPayload) => log('debug', payload),
};
