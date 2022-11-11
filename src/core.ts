import { ContextRuntime, HooksContext } from "./core/type";
import { als } from "asynchronous-local-storage";

export const ContextManager = {
  getValue(key: string) {
    return AsyncLocalStorageRuntime.getValue(key);
  },
  run(ctx: HooksContext, callback: () => Promise<any>) {
    return AsyncLocalStorageRuntime.run(ctx, callback);
  },
};

export function useContext<T = any>(): T {
  return ContextManager.getValue("ctx");
}

export const AsyncLocalStorageRuntime: ContextRuntime = {
  name: "AsyncLocalStorageRuntime",
  getValue(key: string) {
    return als.get<any>(key);
  },
  run(ctx: HooksContext, callback: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      als.runWith(() => callback().then(resolve).catch(reject), ctx);
    });
  },
};

export const hooksContext = {
  get: als.get,
  set: als.set,
}