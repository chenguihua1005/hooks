import { AsyncSeriesBailHook } from '../src/AsyncSeriesBailHook';
describe('AsyncSeriesBailHook', () => {
  it('should not have call method', () => {
    const hook = new AsyncSeriesBailHook();
    expect(hook.call).toEqual(undefined);
    expect(typeof hook.callAsync).toEqual('function');
    expect(typeof hook.promise).toEqual('function');
  });

  it('should have tap method', async () => {
    const hook = new AsyncSeriesBailHook();
    const mockTap = jest.fn();
    hook.tap('somePlugin', mockTap);
    await hook.callAsync();
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  it('should have promise method', async () => {
    const hook = new AsyncSeriesBailHook();
    const mockTap = jest.fn();
    hook.tap('somePlugin', mockTap);
    await hook.promise();
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  it('should bail when a tap return value', async () => {
    const hook = new AsyncSeriesBailHook();
    const mockShouldRunTap = jest.fn().mockReturnValue('nice');
    const mockNeverRunTap = jest.fn();
    hook.tap('should run', mockShouldRunTap);
    hook.tap('should never run', mockNeverRunTap);
    await hook.callAsync((_: any, result: string) => {
      expect(result).toBe('nice');
    });
    expect(mockShouldRunTap).toHaveBeenCalledTimes(1);
    expect(mockNeverRunTap).toHaveBeenCalledTimes(0);
  });

  it('should bail when a tap return value', async () => {
    const hook = new AsyncSeriesBailHook();
    const runMockFn = jest.fn();
    const dontRunMockFn = jest.fn();
    hook.tapPromise('should run', runMockFn);
    hook.tapPromise('should run2', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'stop';
    });
    hook.tapPromise('should never run', dontRunMockFn);
    await hook.callAsync((_: any, result: string) => {
      expect(result).toBe('stop');
    });
    expect(runMockFn).toBeCalledTimes(1);
    expect(dontRunMockFn).toBeCalledTimes(0);
  });
});
