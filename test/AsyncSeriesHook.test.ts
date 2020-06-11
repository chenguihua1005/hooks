import { AsyncSeriesHook } from '../src/AsyncSeriesHook';
describe('AsyncSeriesHook', () => {
  it('should not have call method', () => {
    const hook = new AsyncSeriesHook();
    expect(hook.call).toEqual(undefined);
    expect(typeof hook.callAsync).toEqual('function');
    expect(typeof hook.promise).toEqual('function');
  });

  it('should have tap, tapPromise method', async () => {
    const hook = new AsyncSeriesHook();
    const mockTap = jest.fn();
    const mockPromiseTap = jest.fn().mockReturnValue('promise');
    hook.tap('somePlugin', mockTap);
    hook.tapPromise('promise', () => {
      return new Promise(resolve =>
        setTimeout(() => resolve(mockPromiseTap()), 100)
      );
    });
    const promise = hook.callAsync((_: any, result: any) => {
      expect(result).toMatchObject([undefined, 'promise']);
    });
    expect(mockTap).toHaveBeenCalledTimes(1);
    expect(mockPromiseTap).toBeCalledTimes(0);

    await promise;
    expect(mockPromiseTap).toBeCalledTimes(1);
  });

  it('should throw the same error as tap function', async () => {
    const hook = new AsyncSeriesHook();
    const mockTap = jest.fn();
    hook.tap('somePlugin', mockTap);

    hook.tapPromise('promise', async param => {
      expect(param).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 200));
      throw new Error('error');
    });

    hook.promise(1).catch((e: Error) => expect(e.message).toBe('error'));
    await hook.callAsync(1, (e: Error) => {
      expect(e.message).toBe('error');
    });
  });
});
