import { AsArray, Tap, TapOption, HookInterceptor, CallType } from './types';
import { HookFactoryOption } from 'HookFactory';

export class Hook<T, R> {
  name: string | undefined;
  taps: Tap[] = [];
  interceptors: HookInterceptor[] = [];

  constructor(name?: string) {
    this.name = name;
  }

  compile(_: HookFactoryOption): Function {
    throw new Error('Must be override');
  }

  private _insert(item: Tap) {
    let before;
    if (typeof item.before === 'string') {
      before = new Set([item.before]);
    } else if (Array.isArray(item.before)) {
      before = new Set(item.before);
    }

    let stage = 0;
    if (typeof item.stage === 'number') {
      stage = item.stage;
    }

    const { taps } = this;
    let index = taps.length;

    while (index > 0) {
      index--;

      const tap = taps[index];
      taps[index + 1] = tap;
      const tapStage = tap.stage || 0;

      if (before) {
        if (before.has(tap.name)) {
          before.delete(tap.name);
          continue;
        }
        if (before.size > 0) {
          continue;
        }
      }

      if (tapStage > stage) {
        continue;
      }

      index++;
      break;
    }

    taps[index] = item;
  }

  private _createCall(type: CallType) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      type: type,
    });
  }

  call(...args: any[]) {
    return this._createCall('sync')(...args);
  }

  callAsync(...args: any[]) {
    return this._createCall('async')(...args);
  }

  promise(...args: any[]) {
    return this._createCall('promise')(...args);
  }

  private _tap(
    type: CallType,
    options: string | TapOption,
    fn: (...args: AsArray<T>) => R
  ) {
    let tap = options as Tap;
    if (typeof options === 'string') {
      tap = {
        name: options,
        fn,
        type,
        context: false,
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }
    if (typeof tap.name !== 'string' || tap.name === '') {
      throw new Error('Missing name for tap');
    }
    tap = Object.assign({ type, fn }, tap);
    tap = this._runRegisterInterceptors(tap);
    this._insert(tap);
  }

  tap(options: string | TapOption, fn: (...args: AsArray<T>) => R) {
    this._tap('sync', options, fn);
  }

  tapAsync(options: string | TapOption, fn: (...args: AsArray<T>) => R) {
    this._tap('async', options, fn);
  }

  tapPromise(options: string | TapOption, fn: (...args: AsArray<T>) => R) {
    this._tap('promise', options, fn);
  }

  private _runRegisterInterceptors(options: Tap) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        const newOptions = interceptor.register(options);
        if (newOptions !== undefined) {
          options = newOptions;
        }
      }
    }
    return options;
  }

  withOptions(options: Partial<TapOption>) {
    const mergeOptions = (opt: string | TapOption): TapOption =>
      Object.assign(
        {},
        options,
        typeof opt === 'string' ? { name: opt, context: false } : opt
      );

    return {
      name: this.name,
      tap: (opt: string | Tap, fn: (...args: AsArray<T>) => R) =>
        this.tap(mergeOptions(opt), fn),
      tapAsync: (opt: string | Tap, fn: (...args: AsArray<T>) => R) =>
        this.tapAsync(mergeOptions(opt), fn),
      tapPromise: (opt: string | Tap, fn: (...args: AsArray<T>) => R) =>
        this.tapPromise(mergeOptions(opt), fn),
      intercept: (interceptor: HookInterceptor) => this.intercept(interceptor),
      isUsed: () => this.isUsed(),
      withOptions: (opt: string | Tap) => this.withOptions(mergeOptions(opt)),
    };
  }

  isUsed() {
    return this.taps.length > 0 || this.interceptors.length > 0;
  }

  intercept(interceptor: HookInterceptor) {
    this.interceptors.push(Object.assign({}, interceptor));
    if (interceptor.register) {
      for (let i = 0; i < this.taps.length; i++) {
        this.taps[i] = interceptor.register(this.taps[i]);
      }
    }
  }
}
