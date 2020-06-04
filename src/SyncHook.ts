import { Hook } from './Hook';
import { HookFactory, HookFactoryOption } from './HookFactory';
import async from 'async';

class SyncHookFactory extends HookFactory {
  execute = (...arg: any[]) => {
    const { callback, args } = this.getArgsAndCallback(arg);
    async.allSeries(
      this.getTapFunctions(),
      (fn, callback) => {
        try {
          fn(...args);
          callback(null, true);
        } catch (e) {
          callback(e);
        }
      },
      (error, results) => {
        if (typeof callback === 'function') {
          if (error) {
            callback(error);
          }
          if (results) {
            callback(null, results);
          }
        }
      }
    );
  };
}

export class SyncHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return new SyncHookFactory(options).execute;
  }

  tapAsync() {
    throw new Error('tapAsync is not supported on a SyncHook');
  }

  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncHook');
  }
}
