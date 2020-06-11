import { Hook } from './Hook';
import { HookFactoryOption, HookFactory } from './HookFactory';

class AsyncParallelHookFactory extends HookFactory {
  execute = async (...arg: unknown[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    const tapFns = this.getTapFunctions();

    try {
      const results = await Promise.all(
        tapFns.map(
          fn =>
            new Promise(resolve => {
              const fnResult = fn(...args, (err: Error, result: unknown) => {
                if (err) {
                  resolve(err);
                }
                resolve(result);
              });

              if (Promise.resolve(fnResult) == fnResult) {
                fnResult.then(resolve).catch(resolve);
              }
            })
        )
      );
      if (typeof callback === 'function') {
        callback(null, results);
      }
    } catch (error) {
      if (typeof callback === 'function') {
        if (error) {
          callback(error);
        }
      }
    }
    return;
  };
}

export class AsyncParallelHook<T = any, R = any> extends Hook<T, R> {
  constructor(name?: string) {
    super(name);

    // @ts-ignore
    this.call = undefined;
  }
  compile(options: HookFactoryOption) {
    return new AsyncParallelHookFactory(options).execute;
  }
}
