import { HookFactoryOption, HookFactory, WorkOption } from './HookFactory';
import { Hook } from './Hook';

class SyncWaterfallHookCodeFactory extends HookFactory {
  execute({ onError, onResult }: Required<WorkOption>) {
    return this.callTapsSeries({
      onError: (_: number, err: Error) => onError(err),
      onDone: () => {
        const result = this._args[0];
        onResult(result);
        return result;
      },
      onResult: (_: any, result: any) => {
        // Somehow there is a special case when result is undefined, do not override with undefined
        if (result !== undefined) {
          this._args[0] = result;
        }
      },
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
