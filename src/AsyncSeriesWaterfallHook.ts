import { getArgsAndCallback } from './utils';
import { IHookOpts } from './types';

export const executeAsyncSeriesWaterfallHook = async (
  tapFns: IHookOpts['fn'][],
  ...arg: any[]
) => {
  const { args, callback } = getArgsAndCallback(arg);

  let error: Error | undefined;
  for (let i = 0; i < tapFns.length; i++) {
    try {
      let promiseResult = await tapFns[i](...args);
      if (typeof args[0] !== 'undefined') {
        args[0] = promiseResult;
      }
    } catch (e) {
      error = e;
      break;
    }
  }

  if (error) {
    callback(error);
  } else {
    callback(null, args[0]);
  }
};
