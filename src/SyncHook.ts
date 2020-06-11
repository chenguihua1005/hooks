import { Hook } from './Hook';
import { HookFactory, HookFactoryOption } from './HookFactory';

type Results = unknown[];
type SyncReturnPayload = [Results, Error | undefined];
class SyncHookFactory extends HookFactory {
  execute = (...arg: any[]) => {
    const { callback, args } = this.getArgsAndCallback(arg);

    const tapFns = this.getTapFunctions();
    let [results, error]: SyncReturnPayload = [[], undefined];
    for (let i = 0; i < tapFns.length; i++) {
      try {
        results.push(tapFns[i](...args));
      } catch (e) {
        error = e;
        break;
      }
    }

    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      }
      if (results) {
        callback(null, results);
      }
    }
  };
}

export class SyncHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return new SyncHookFactory(options).execute;
  }

  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncHook');
  }
}
