import { AsyncSeriesBailHook } from '../src/AsyncSeriesBailHook';
describe('AsyncSeriesBailHook', () => {
  it('should call promise method', async () => {
    const hook = new AsyncSeriesBailHook();
    const mockTap = jest.fn();
    hook.tapPromise('somePlugin', mockTap);
    const result = await hook.promise();
    expect(result).toBe(undefined);
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  it('should bail when a tap return value', async () => {
    const hook = new AsyncSeriesBailHook();
    const mockShouldRunTap = jest.fn().mockReturnValue('nice');
    const mockNeverRunTap = jest.fn();
    hook.tapPromise('should run', mockShouldRunTap);
    hook.tapPromise('should never run', mockNeverRunTap);
    const result = await hook.promise();
    expect(result).toBe('nice');

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
    const result = await hook.promise();
    expect(result).toBe('stop');
    expect(runMockFn).toBeCalledTimes(1);
    expect(dontRunMockFn).toBeCalledTimes(0);
  });
});
