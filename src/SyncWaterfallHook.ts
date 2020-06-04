import { Hook } from './Hook';
import { HookFactory, HookFactoryOption } from './HookFactory';
import async from 'async';

class SyncWaterfallFactory extends HookFactory {
  execute = (...arg: any[]) => {
    let returnResults;
    const { callback, args } = this.getArgsAndCallback(arg);

    const tapFns = this.getTapFunctions();

    if (tapFns.length === 0 && typeof callback === 'function') {
      callback(null, undefined);
      return;
    }

    async.waterfall(
      tapFns.map((fn, index) => {
        return (...internalArgs: any) => {
          const callback = internalArgs[internalArgs.length - 1];
          const restInternalArgs =
            index === 0 ? args : internalArgs.slice(0, internalArgs.length - 1);

          try {
            const result = fn(...restInternalArgs);
            callback(null, ...Object.assign(args, [result]));
          } catch (e) {
            callback(e);
          }
        };
      }),
      (error, results) => {
        returnResults = results;
        if (typeof callback === 'function') {
          if (error) {
            callback(error);
          } else {
            callback(null, results);
          }
        }
      }
    );

    if (typeof callback !== 'function') {
      return returnResults;
    }

    return;
  };
}

export class SyncWaterfallHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return new SyncWaterfallFactory(options).execute;
  }

  tapAsync() {
    throw new Error('tapAsync is not supported on a SyncHook');
  }

  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncHook');
  }
}
