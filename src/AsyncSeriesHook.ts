import { Hook } from './Hook';
import { HookFactoryOption, HookFactory } from './HookFactory';
import async from 'async';

class AsyncSeriesHookFactory extends HookFactory {
  execute = (...arg: unknown[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    async.series(
      this.getTapFunctions().map(fn => callback => {
        try {
          callback(null, fn(...args));
        } catch (e) {
          callback(e);
        }
      }),
      (error, results) => {
        if (callback) {
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

export class AsyncSeriesHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return new AsyncSeriesHookFactory(options).execute;
  }
}
