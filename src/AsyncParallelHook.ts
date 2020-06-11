import { InternalHook } from './InternalHook';

export class AsyncParallelHook<R = any> extends InternalHook<R> {
  execute = async (...arg: unknown[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    const tapFns = this.getTapFunctions();

    try {
      const results = await Promise.all(tapFns.map(fn => fn(...args)));
      callback(null, results);
    } catch (error) {
      if (error) {
        callback(error);
      }
    }
  };
}