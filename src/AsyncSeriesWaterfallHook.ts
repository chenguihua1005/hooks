import { InternalHook } from './InternalHook';

export class AsyncSeriesWaterfallHook<R = any> extends InternalHook<R> {
  execute = async (...arg: any[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    const tapFns = this.getTapFunctions();

    let error: Error | undefined;
    for (let i = 0; i < tapFns.length; i++) {
      try {
        let promiseResult = await tapFns[i](...args);
        if (typeof args[0] !== 'undefined') {
          args[0] = promiseResult;
        }
      } catch (e) {
        error = e;
        break;
      }
    }

    if (error) {
      callback(error);
    }
    callback(null, args[0]);
  };
}
