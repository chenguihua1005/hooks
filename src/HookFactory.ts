import { Tap, HookInterceptor } from './types';
const noop = () => {};

export interface HookFactoryOption {
  type: 'sync' | 'promise' | 'async';
  taps: Array<Tap>;
  interceptors?: Array<HookInterceptor>;
}

export interface WorkOption {
  onResult?: Function;
  onDone?: Function;
  onError?: Function;
  resultReturns?: boolean;
  rethrowIfPossible?: boolean;
}

export abstract class HookFactory {
  config: any;
  options?: HookFactoryOption;
  private _args: Array<any> = [];

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
          fn = this.composeWithInterceptors({
            onResult: (result: any) => result,
            onError: (err: Error) => {
              throw err;
            },
            onDone: () => {},
          });
          break;
        }
        case 'async': {
          const callback = this._args[args.length - 1];
          this._args = this._args.slice(0, args.length - 1); // remove callback from callAsync
          fn = this.composeWithInterceptors({
            onResult: (result: any) => callback(null, result),
            onDone: callback,
            onError: callback,
          });
          break;
        }
        case 'promise': {
          fn = () =>
            new Promise((resolve, reject) => {
              this.composeWithInterceptors({
                onResult: resolve,
                onDone: resolve,
                onError: reject,
              })();
            });
          break;
        }
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

  callTapSeries({
    onError,
    onDone,
    onResult,
    ...restOptions
  }: Required<WorkOption>) {
    const { options: { taps = [] } = {} } = this;
    if (taps.length === 0) {
      onDone(this._args);
      return;
    }
    for (let i = 0; i < taps.length; i++) {
      this.callTap(i, { ...restOptions, onResult, onDone, onError });
    }
  }

  callTap(
    tapIndex: number,
    { onError, onResult, onDone }: Required<WorkOption>
  ) {
    const { options: { taps = [] } = {} } = this;

    const tap = taps[tapIndex];

    switch (tap.type) {
      case 'sync': {
        let result;
        try {
          result = tap.fn(...this._args);
          onResult(result);
          onDone();
        } catch (e) {
          onError(e);
        }
        break;
      }
      case 'promise': {
        Promise.resolve(tap.fn(...this._args))
          .then(value => {
            onResult(value);
            onDone();
          })
          .catch(e => onError(e));
        break;
      }
      case 'async': {
        Promise.resolve(tap.fn(...this._args))
          .then(value => {
            onResult(value);
            onDone();
          })
          .catch(e => onError(e));
        break;
      }
    }
  }

  execute(_: WorkOption) {
    throw new Error('must be override');
  }
}
