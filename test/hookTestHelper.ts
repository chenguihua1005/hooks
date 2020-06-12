import { IHookOpts } from '../src/types';
import { sortHookFns, promisify } from '../src/utils';

export const runHook = (
  hooks: IHookOpts<any>[],
  hookExecute: Function,
  ...args: any[]
) => {
  return promisify(hookExecute.bind(null, sortHookFns(hooks), ...args));
};
