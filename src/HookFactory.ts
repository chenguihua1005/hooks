import { Tap, HookInterceptor } from './types';
const noop = () => {};

export interface HookFactoryOption {
  type: 'sync' | 'promise' | 'async';
  taps: Array<Tap>;
  interceptors?: Array<HookInterceptor>;
}

export interface WorkOption {
  onError: any;
  onDone: any;
}

export class HookFactory {
  config: any;
  options?: HookFactoryOption;
  protected _args: Array<any> = [];

  constructor(config?: any) {
    this.config = config;
  }

  create(options: HookFactoryOption) {
    this.options = options;

    let fn: Function = noop;
    return (...args: any[]) => {
      this._args = args;
      switch (this.options?.type) {
        case 'sync': {
          fn = this.execute();
          break;
        }
        // case 'async': {
        //   const callback = this._args[args.length - 1];
        //   this._args = this._args.slice(0, args.length - 1); // remove callback from callAsync
        //   fn = this.composeWithInterceptors({
        //     onResult: (result: any) => {
        //       console.log({ result });
        //       callback(null, result);
        //     },
        //     onDone: callback,
        //     onError: callback,
        //   });
        //   break;
        // }
        // case 'promise': {
        //   fn = () =>
        //     new Promise((resolve, reject) => {
        //       this.composeWithInterceptors({
        //         onResult: resolve,
        //         onDone: resolve,
        //         onError: reject,
        //       })();
        //     });
        //   break;
        // }
      }
      return fn();
    };
  }

  composeWithInterceptors(options: WorkOption): Function {
    const { options: { interceptors = [] } = {} } = this;
    if (interceptors.length > 0) {
      interceptors.forEach(interceptor => {
        if (interceptor.call) {
          interceptor.call(...this._args);
        }
      });
      const { onError, onDone, onResult, ...restOptions } = options;
      return () =>
        this.execute({
          ...restOptions,
          onError: onError
            ? (err: Error) => {
                interceptors.forEach(interceptor => {
                  if (interceptor.error) {
                    interceptor.error(err);
                  }
                });
              }
            : noop,
          onResult: onResult
            ? (result: any) => {
                interceptors.forEach(interceptor => {
                  if (interceptor.result) {
                    interceptor.result(result);
                  }
                });
              }
            : noop,
          onDone: onDone
            ? () => {
                interceptors.forEach(interceptor => {
                  if (interceptor.done) {
                    interceptor.done();
                  }
                });
              }
            : noop,
        });
    }

    return () => this.execute(options);
  }

  callTapsSeries({
    onError,
    onDone,
    onResult,
    resultReturns,
    ...restOptions
  }: WorkOption) {
    const { options: { taps = [] } = {} } = this;
    if (taps.length === 0) {
      return onDone && onDone(this._args);
    }
    for (let i = 0; i < taps.length; i++) {
      this.callTap(i, {
        ...restOptions,
        resultReturns,
        onDone: !onResult ? onDone : undefined,
        onError: (error: Error) => onError && onError(i, error),
        onResult:
          onResult &&
          ((result: any) => {
            return onResult(i, result, onDone);
          }),
      });
    }
    if (resultReturns) {
      console.log({ resultReturns });
      return resultReturns();
    }
  }

  callTap(tapIndex: number, { onError, onResult, onDone }: WorkOption) {
    const { options: { taps = [] } = {} } = this;

    const tap = taps[tapIndex];

    switch (tap.type) {
      case 'sync': {
        let result;
        try {
          result = tap.fn(...this._args);
          onResult && onResult(result);
          onDone && onDone();
        } catch (e) {
          onError && onError(e);
        }
        break;
      }
      case 'promise': {
        Promise.resolve(tap.fn(...this._args))
          .then(value => {
            onResult && onResult(value);
            onDone && onDone();
          })
          .catch(e => onError && onError(e));
        break;
      }
      case 'async': {
        Promise.resolve(tap.fn(...this._args))
          .then(value => {
            onResult && onResult(value);
            onDone && onDone();
          })
          .catch(e => onError && onError(e));
        break;
      }
    }
  }

  execute(_: WorkOption) {
    throw new Error('must be override');
  }
}
