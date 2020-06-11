import { AsyncSeriesWaterfallHook } from '../src/AsyncSeriesWaterfallHook';

describe('AsyncSeriesWaterfallHook', () => {
  it('should not have call method', () => {
    const hook = new AsyncSeriesWaterfallHook();
    expect(hook.call).toEqual(undefined);
    expect(typeof hook.callAsync).toEqual('function');
    expect(typeof hook.promise).toEqual('function');
  });

  it('should have tap method', async () => {
    const hook = new AsyncSeriesWaterfallHook();
    hook.tap('somePlugin', arg => {
      return arg + 1;
    });
    const result = await hook.callAsync(42);
    expect(result).toBe(43);
  });

  it('should have promise method', async () => {
    const hook = new AsyncSeriesWaterfallHook();
    hook.tapPromise('add 1', arg => {
      expect(arg).toBe(43);
      return new Promise(resolve => {
        setTimeout(() => resolve(arg + 1), 100);
      });
    });
    hook.tapPromise('add 2', arg => {
      expect(arg).toBe(44);
      return new Promise(resolve => {
        setTimeout(() => resolve(arg + 2), 100);
      });
    });
    const result = await hook.promise(43);
    expect(result).toBe(46);
    await hook.callAsync(43, (_: any, total: number) => {
      expect(total).toBe(46);
    });
  });

  it('should throw error promise rejection', async done => {
    const hook = new AsyncSeriesWaterfallHook();
    hook.tapPromise('add 1', arg => {
      expect(arg).toBe(43);
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('something wrong'));
        }, 100);
      });
    });
    hook.tapPromise('add 2', arg => {
      expect(arg).toBe(44);
      return new Promise(resolve => {
        setTimeout(() => resolve(arg + 2), 100);
      });
    });
    hook.promise(43).catch((e: Error) => {
      expect(e.message).toBe('something wrong');
      done();
    });
    hook.callAsync(43, (err: Error) => {
      expect(err.message).toBe('something wrong');
    });
  });
});
