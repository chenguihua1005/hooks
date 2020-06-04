import { HookInterceptor, Tap } from 'types';

export interface HookFactoryOption {
  type: 'sync' | 'promise' | 'async';
  taps: Array<Tap>;
  interceptors?: Array<HookInterceptor>;
}

export abstract class HookFactory {
  options: HookFactoryOption;

  constructor(options: HookFactoryOption) {
    this.options = options;
  }

  getTapFunctions = () => {
    return this.options.taps.map(({ fn }) => fn);
  };

  getArgsAndCallback = (args: unknown[]) => {
    let callback: Function | undefined;
    if (args.length > 0) {
      const lastArgument = args[args.length - 1];
      if (typeof lastArgument === 'function') {
        callback = lastArgument;
        args = args.slice(0, args.length - 1);
      }
    }
    return { callback, args };
  };

  abstract execute(callback?: Function): any;
}
