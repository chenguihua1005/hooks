import { IHookOpts } from './types';
import { getArgsAndCallback } from './utils';

export const executeAsyncSeriesBailHook = async (
  tapFns: IHookOpts['fn'][],
  ...arg: any[]
) => {
  const { args, callback } = getArgsAndCallback(arg);

  let result: unknown = [];
  let error: Error | undefined;

  for (let i = 0; i < tapFns.length; i++) {
    try {
      result = tapFns[i](...args);

      if (Promise.resolve(result) === result) {
        result = await result;
      }

      if (result) {
        break;
      }
    } catch (e) {
      error = e;
      break;
    }
  }

  if (error) {
    callback(error);
  } else {
    callback(null, result);
  }
};
