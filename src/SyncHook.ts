import { Hook } from './Hook';
import { HookFactory, HookFactoryOption, WorkOption } from './HookFactory';

class SyncHookFactory extends HookFactory {
  execute({ onError, onDone, rethrowIfPossible }: Required<WorkOption>) {
    return this.callTapSeries({
      onError: (_: number, err: Error) => onError(err),
      onDone,
      rethrowIfPossible,
      onResult: () => {},
      resultReturns: false,
    });
  }
}

const factory = new SyncHookFactory();

export class SyncHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return factory.create(options);
  }

  tapAsync() {
    throw new Error('tapAsync is not supported on a SyncHook');
  }

  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncHook');
  }
}
