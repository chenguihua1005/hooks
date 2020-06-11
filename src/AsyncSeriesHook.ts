import { InternalHook } from './InternalHook';

export class AsyncSeriesHook<R = any> extends InternalHook<R> {
  execute = async (...arg: unknown[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    const tapFns = this.getTapFunctions();

    let results: unknown[] = [];
    let error: Error | undefined;
    for (let i = 0; i < tapFns.length; i++) {
      try {
        results.push(await tapFns[i](...args));
      } catch (e) {
        error = e;
        break;
      }
    }

    if (error) {
      callback(error);
      return;
    }
    callback(null, results);
  };
}
