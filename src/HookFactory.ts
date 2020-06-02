import { Tap, HookInterceptor } from './types';
const noop = () => {};
const proxy = (result: any) => result;

export interface HookFactoryOption {
  type: 'sync' | 'promise' | 'async';
  taps: Array<Tap>;
  interceptors?: Array<HookInterceptor>;
}

export interface WorkOption {
  onError: any;
  onDone: any;
  onResult: any;
}

export class HookFactory {
  config: any;
  options?: HookFactoryOption;
  protected _args: Array<any> = [];
  workDone: number = 0;

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
          fn = () =>
            this.execute({
              onError: (err: Error) => {
                throw err;
              },
              onDone: noop,
              onResult: proxy,
            });
          break;
        }
        case 'async': {
          const callback = this._args[args.length - 1];
          this._args = this._args.slice(0, args.length - 1); // remove callback from callAsync
          fn = () =>
            this.execute({
              onDone: callback,
              onError: callback,
              onResult: (result: any) => callback(null, result),
            });
          break;
        }
        case 'promise': {
          fn = () =>
            new Promise((resolve, reject) => {
              this.execute({
                onDone: resolve,
                onError: reject,
                onResult: resolve,
              });
            });
          break;
        }
      }
      return fn();
    };
  }

  // composeWithInterceptors(options: WorkOption): Function {
  //   const { options: { interceptors = [] } = {} } = this;
  //   if (interceptors.length > 0) {
  //     interceptors.forEach(interceptor => {
  //       if (interceptor.call) {
  //         interceptor.call(...this._args);
  //       }
  //     });
  //     const { onError, onDone, onResult, ...restOptions } = options;
  //     return () =>
  //       this.execute({
  //         ...restOptions,
  //         onError: onError
  //           ? (err: Error) => {
  //               interceptors.forEach(interceptor => {
  //                 if (interceptor.error) {
  //                   interceptor.error(err);
  //                 }
  //               });
  //             }
  //           : noop,
  //         onResult: onResult
  //           ? (result: any) => {
  //               interceptors.forEach(interceptor => {
  //                 if (interceptor.result) {
  //                   interceptor.result(result);
  //                 }
  //               });
  //             }
  //           : noop,
  //         onDone: onDone
  //           ? () => {
  //               interceptors.forEach(interceptor => {
  //                 if (interceptor.done) {
  //                   interceptor.done();
  //                 }
  //               });
  //             }
  //           : noop,
  //       });
  //   }

  //   return () => this.execute(options);
  // }

  callTapsSeries({ onError, onDone, onResult }: WorkOption) {
    const { options: { taps = [] } = {} } = this;
    this.workDone = 0;

    if (taps.length === 0) {
      return onDone && onDone(this._args);
    }

    for (let i = 0; i < taps.length; i++) {
      this.callTap(i, {
        onDone,
        onError: (error: Error) => onError && onError(i, error),
        onResult: (result: any) => onResult && onResult(i, result),
      });
    }

    if (this.workDone === taps.length) {
      return onDone();
    }
  }

  callTap(tapIndex: number, { onError, onResult }: WorkOption) {
    const { options: { taps = [] } = {} } = this;

    const tap = taps[tapIndex];
    switch (tap.type) {
      case 'sync': {
        try {
          const result = tap.fn(...this._args);
          this.workDone += 1;
          onResult(result);
        } catch (e) {
          onError && onError(e);
        }
        break;
      }
      case 'promise': {
        Promise.resolve(tap.fn(...this._args))
          .then(_ => {
            this.workDone += 1;
          })
          .catch(e => onError && onError(e));
        break;
      }
      case 'async': {
        Promise.resolve(tap.fn(...this._args))
          .then(_ => {
            this.workDone += 1;
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
