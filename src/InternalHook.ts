import { Tap, TapOption } from './types';

export abstract class InternalHook<R> {
  name: string | undefined;
  taps: Tap[] = [];

  constructor(name?: string) {
    this.name = name;
  }

  abstract execute(...args: any[]): any;

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

  promise(...args: any[]) {
    const fn = this.execute;

    return new Promise((resolve, reject) => {
      fn(...args, (err: unknown, results: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  tapPromise(options: string | TapOption, fn: (...args: any[]) => R) {
    let tap = options as Tap;
    if (typeof options === 'string') {
      tap = {
        name: options,
        fn,
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }
    if (typeof tap.name !== 'string' || tap.name === '') {
      throw new Error('Missing name for tap');
    }
    tap = Object.assign({ fn }, tap);
    this._insert(tap);
  }

  getTapFunctions = () => {
    return this.taps.map(({ fn }) => fn);
  };

  getArgsAndCallback = (args: any[]) => {
    const lastArgument = args[args.length - 1];
    let callback = lastArgument as Function;
    args = args.slice(0, args.length - 1);
    return { callback, args };
  };
}
