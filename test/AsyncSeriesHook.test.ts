import { AsyncSeriesHook } from '../src/AsyncSeriesHook';
describe('AsyncSeriesHook', () => {
  it('should have tap, tapPromise method', async () => {
    const hook = new AsyncSeriesHook();
    const mockTap = jest.fn();
    const mockPromiseTap = jest.fn().mockReturnValue('promise');
    hook.tapPromise('somePlugin', mockTap);
    hook.tapPromise('promise', () => {
      return new Promise(resolve =>
        setTimeout(() => resolve(mockPromiseTap()), 100)
      );
    });
    const promise = hook.promise();

    expect(mockTap).toHaveBeenCalledTimes(1);
    expect(mockPromiseTap).toBeCalledTimes(0);

    const result = await promise;
    expect(mockPromiseTap).toBeCalledTimes(1);
    expect(result).toMatchObject([undefined, 'promise']);
  });

  it('should throw the same error as tap function', async () => {
    const hook = new AsyncSeriesHook();
    const mockTap = jest.fn();
    hook.tapPromise('somePlugin', mockTap);

    hook.tapPromise('promise', async param => {
      expect(param).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 200));
      throw new Error('error');
    });

    try {
      await hook.promise(1);
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });
});
