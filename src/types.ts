type FixedSizeArray<T extends number, U> = T extends 0
  ? void[]
  : ReadonlyArray<U> & {
      0: U;
      length: T;
    };

export type AsArray<T> = T extends any[] ? T : [T];

export type ArgumentNames<T extends any[]> = FixedSizeArray<
  T['length'],
  string
>;

export interface Tap<F extends Function = Function> {
  name: string;
  type: CallType;
  fn: F;
  context?: boolean;
  stage?: number;
  before?: string | Array<string>;
}

export type TapOption = Omit<Tap, 'type' | 'fn'>;

export interface HookInterceptor {
  name?: string;
  tap?: (tap: Tap) => void;
  call?: (...args: any[]) => void;
  loop?: (...args: any[]) => void;
  error?: (err: Error) => void;
  // TODO use tap result
  result?: (result: any) => void;
  done?: () => void;
  register?: (hook: Tap) => Tap;
}

export type CallType = 'sync' | 'async' | 'promise';
