export interface IHookOpts<InitValue = null, Args extends any[] = any[]> {
  name: string;
  fn: InitValue extends null
    ? (...args: Args) => void | Promise<void>
    : (init: InitValue, ...args: Args) => InitValue | Promise<InitValue>;
  before?: string;
  stage?: number;
}

export interface ICallHookOpts<Name extends string = string, InitV = unknown> {
  name: Name;
  bail?: boolean;
  parallel?: boolean;
  initialValue?: InitV;
}
