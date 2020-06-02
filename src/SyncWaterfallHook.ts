import { HookFactoryOption, HookFactory, WorkOption } from './HookFactory';
import { Hook } from './Hook';

class SyncWaterfallHookCodeFactory extends HookFactory {
  execute({ onError, onResult, rethrowIfPossible }: Required<WorkOption>) {
    return this.callTapsSeries({
      onError: (_: number, err: Error) => onError(err),
      onResult: (_: number, result: any, done: Function) => {
        console.log({ result });
        this._args[0] = result;
        done();
      },
      onDone: () => onResult(this._args[0]),
      resultReturns: () => this._args[0],
      rethrowIfPossible,
    });
  }
}

const factory = new SyncWaterfallHookCodeFactory();

export class SyncWaterfallHook<T = any, R = any> extends Hook<T, R> {
  compile(options: HookFactoryOption) {
    return factory.create(options);
  }

  tapAsync() {
    throw new Error('tapAsync is not supported on a SyncWaterfallHook');
  }

  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncWaterfallHook');
  }
}
