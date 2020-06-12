import { getArgsAndCallback } from './utils';
import { IHookOpts } from './types';

export const executeAsyncSeriesHook = async (
  tapFns: IHookOpts['fn'][],
  ...arg: any[]
) => {
  const { args, callback } = getArgsAndCallback(arg);

  let results: unknown[] = [];
  let error: Error | undefined;
  for (let i = 0; i < tapFns.length; i++) {
    try {
      results.push(await tapFns[i](...args));
    } catch (e) {
      error = e;
      break;
    }
  }

  if (error) {
    callback(error);
  } else {
    callback(null, results);
  }
};
