import { IHookOpts } from './types';
import { getArgsAndCallback } from './utils';

export const executeAsyncParallelHook = async (
  tapFns: IHookOpts['fn'][],
  ...arg: any[]
) => {
  const { args, callback } = getArgsAndCallback(arg);

  try {
    const results = await Promise.all(tapFns.map(fn => fn(...args)));
    callback(null, results);
  } catch (error) {
    if (error) {
      callback(error);
    }
  }
};
