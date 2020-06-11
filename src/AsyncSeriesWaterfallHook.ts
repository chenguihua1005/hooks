import { Hook } from './Hook';
import { HookFactoryOption, HookFactory } from './HookFactory';

class AsyncSeriesWaterfallHookFactory extends HookFactory {
  execute = async (...arg: unknown[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    const tapFns = this.getTapFunctions();

    let error: Error | undefined;
    for (let i = 0; i < tapFns.length; i++) {
      try {
        let promiseResult = await new Promise((resolve, reject) => {
          const tapFnResult = tapFns[i](
            ...args,
            (err: Error, result: unknown) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result);
            }
          );
          if (Promise.resolve(tapFnResult) === tapFnResult) {
            tapFnResult.then(resolve).catch(reject);
          } else {
            resolve(tapFnResult);
          }
        });
        if (typeof args[0] !== 'undefined') {
          args[0] = promiseResult;
        }
      } catch (e) {
        error = e;
        break;
      }
    }

    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      }
      callback(null, args[0]);
    }
    return args[0];
  };
}

export class AsyncSeriesWaterfallHook<T = any, R = any> extends Hook<T, R> {
  constructor(name?: string) {
    super(name);

    // @ts-ignore
    this.call = undefined;
  }
  compile(options: HookFactoryOption) {
    return new AsyncSeriesWaterfallHookFactory(options).execute;
  }
}
