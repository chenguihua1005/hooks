import { IHookOpts } from 'types';

export const getArgsAndCallback = (args: any[]) => {
  const lastArgument = args[args.length - 1];
  let callback = lastArgument as Function;
  args = args.slice(0, args.length - 1);
  return { callback, args };
};

export const getHooksFunctions = (hooks: IHookOpts[]) => {
  return hooks.map(({ fn }) => fn);
};

export const promisify = <R = any>(fn: Function): Promise<R> => {
  return new Promise((resolve, reject) => {
    fn((err: unknown, results: R) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

export const sortHookFns = (
  hooks: IHookOpts[],
  transformFn: <R extends Function>(fn: R) => R = fn => fn
) => {
  const orderedHooks: IHookOpts[] = [];

  hooks.forEach(item => {
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

    let index = orderedHooks.length;

    while (index > 0) {
      index--;

      const tap = orderedHooks[index];
      orderedHooks[index + 1] = tap;
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

    orderedHooks[index] = item;
  });

  return orderedHooks.map(({ fn }) => transformFn(fn));
};
