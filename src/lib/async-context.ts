import { AsyncLocalStorage } from 'async_hooks';

export interface RequestLifeInfo {
  reqId: string;
  seqId: string;
  lid: string | null;
  life: number;
  cip: string;
  quid: string;
  uin: string;
  method: string;
  url: string;
  startTime: bigint;
}

export interface AsyncStore {
  lifeInfo: RequestLifeInfo;
}

const asyncLocalStorage = new AsyncLocalStorage<AsyncStore>();

export function getAsyncStore(): AsyncStore | undefined {
  return asyncLocalStorage.getStore();
}

export function runWithinAsyncStore(
  store: AsyncStore,
  callback: () => Promise<void>,
): Promise<void> {
  return asyncLocalStorage.run(store, callback);
}
