import { executeAsyncParallelHook } from './AsyncParallelHook';
import { executeAsyncSeriesHook } from './AsyncSeriesHook';
import { executeAsyncSeriesBailHook } from './AsyncSeriesBailHook';
import { executeAsyncSeriesWaterfallHook } from './AsyncSeriesWaterfallHook';

import { IHookOpts, ICallHookOpts } from './types';
import { insertHook, getHooksFunctions } from './utils';

async function callSerailWithInitialValue<R = unknown>(
  hooks: IHookOpts[],
  args: any[],
  initialValue: R
): Promise<R> {
  const fns = getHooksFunctions(hooks);

  return executeAsyncSeriesWaterfallHook(fns, initialValue, ...args);
}

async function callSerail<R = unknown>(
  hooks: IHookOpts[],
  args: any[],
  bail: boolean
): Promise<R> {
  const thookFn = bail ? executeAsyncSeriesBailHook : executeAsyncSeriesHook;
  const fns = getHooksFunctions(hooks);
  return thookFn(fns, ...args) as Promise<R>;
}

async function callParallel<R = unknown>(
  hooks: IHookOpts[],
  args: any[]
): Promise<R> {
  const fns = getHooksFunctions(hooks);

  return (await (executeAsyncParallelHook(fns, ...args) as any)) as Promise<R>;
}

export class Hooks {
  private _hooks = new Map<string, IHookOpts[]>();

  constructor() {}

  addHook(name: string, hook: IHookOpts<any, any[]>) {
    let hooks = this._hooks.get(name);
    if (!hooks) {
      hooks = [];
      this._hooks.set(name, hooks);
    }

    insertHook(hooks, hook);
  }

  async callHook<R = unknown>(name: string, ...args: any[]): Promise<R>;
  async callHook<R = unknown>(
    options: ICallHookOpts,
    ...args: any[]
  ): Promise<R>;
  async callHook<R = unknown>(
    options: string | ICallHookOpts,
    ...args: any[]
  ): Promise<R> {
    const defaultOpts = {
      bail: false,
      parallel: false,
      initialValue: undefined,
    };
    let opts: Required<ICallHookOpts>;
    if (typeof options === 'object') {
      opts = {
        ...defaultOpts,
        ...options,
      };
    } else {
      opts = {
        ...defaultOpts,
        name: options,
      };
    }

    const hasInitialValue = typeof opts.initialValue !== 'undefined';

    const hooks = this._hooks.get(opts.name);
    if (!hooks || hooks.length <= 0) {
      // @ts-ignore no return value
      return hasInitialValue ? opts.initialValue : [];
    }

    if (opts.parallel) {
      return await callParallel<R>(hooks, args);
    } else if (hasInitialValue) {
      return await callSerailWithInitialValue<R>(
        hooks,
        args,
        opts.initialValue as any
      );
    } else {
      return await callSerail<R>(hooks, args, opts.bail);
    }
  }
}
