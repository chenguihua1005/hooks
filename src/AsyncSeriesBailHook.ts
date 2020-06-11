import { InternalHook } from './InternalHook';

export class AsyncSeriesBailHook<R = any> extends InternalHook<R> {
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

    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  };
}
