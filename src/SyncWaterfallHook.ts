import { Hook } from './Hook';
import { HookFactory, HookFactoryOption } from './HookFactory';

class SyncWaterfallFactory extends HookFactory {
  execute = (...arg: any[]) => {
    const { callback, args } = this.getArgsAndCallback(arg);

    const tapFns = this.getTapFunctions();

    if (args.length < 1) {
      throw new Error('Waterfall hooks must have at least one argument');
    }

    if (tapFns.length === 0) {
      if (typeof callback === 'function') {
        callback(null, undefined);
      }
      return;
    }

    let error: Error | undefined;

    for (let i = 0; i < tapFns.length; i++) {
      try {
        args[0] = tapFns[i](...args);
      } catch (e) {
        error = e;
        break;
      }
    }

    if (typeof callback === 'function') {
      if (error) {
        callback(error);
        throw error;
      }
      if (args[0]) {
        callback(null, args[0]);
        return args[0];
      }
    }
    return args[0];
  };
}

export class SyncWaterfallHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return new SyncWaterfallFactory(options).execute;
  }

  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncHook');
  }
}
