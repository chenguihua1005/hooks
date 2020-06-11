import { Hook } from './Hook';
import { HookFactoryOption, HookFactory } from './HookFactory';

class AsyncSeriesBailHookFactory extends HookFactory {
  execute = async (...arg: unknown[]) => {
    const { args, callback } = this.getArgsAndCallback(arg);
    const tapFns = this.getTapFunctions();

    let result: unknown = [];
    let error: Error | undefined;

    for (let i = 0; i < tapFns.length; i++) {
      try {
        result = tapFns[i](...args);

        if (Promise.resolve(result) === result) {
          result = await result;
        }

        if (result) {
          break;
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
      callback(null, result);
    }
  };
}

export class AsyncSeriesBailHook<T = any, R = any> extends Hook<T, R> {
  constructor(name?: string) {
    super(name);

    // @ts-ignore
    this.call = undefined;
  }
  compile(options: HookFactoryOption) {
    return new AsyncSeriesBailHookFactory(options).execute;
  }
}
