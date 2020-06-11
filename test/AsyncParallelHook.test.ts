import { AsyncParallelHook } from '../src/AsyncParallelHook';

describe('AsyncParallelHook', () => {
  it('should not have call method', () => {
    const hook = new AsyncParallelHook();
    expect(hook.call).toEqual(undefined);
    expect(typeof hook.callAsync).toEqual('function');
    expect(typeof hook.promise).toEqual('function');
  });

  it('should have tap method', async () => {
    const hook = new AsyncParallelHook();
    hook.tap('add 1', (arg, callback) => {
      callback(null, arg + 1);
    });
    hook.tap('add 2', (arg, callback) => {
      callback(null, arg + 2);
    });

    // should not bail
    hook.tap('throw error', (_, callback) => {
      callback(new Error('wrong'));
    });

    const result = await new Promise(resolve =>
      hook.callAsync(42, (_: any, res: unknown) => resolve(res))
    );

    expect(result).toMatchObject([43, 44, new Error('wrong')]);
  });

  it('should have promise method', async () => {
    const hook = new AsyncParallelHook();

    hook.tapPromise('addition', (num1, num2, callback) => {
      setTimeout(() => callback(null, num1 + num2), 100);
    });
    hook.tapPromise('substraction', (num1, num2) => {
      return new Promise(resolve => {
        setTimeout(() => resolve(num1 - num2), 100);
      });
    });

    const result = await hook.promise(42, 41);
    expect(result).toMatchObject([83, 1]);
  });

  it('should have promise method', async () => {
    const hook = new AsyncParallelHook();

    hook.tapPromise('addition', (num1, num2, callback) => {
      setTimeout(() => callback(null, num1 + num2), 100);
    });

    hook.tapPromise('substraction', (num1, num2) => {
      return new Promise(resolve => {
        setTimeout(() => resolve(num1 - num2), 100);
      });
    });

    hook.tapPromise('substraction', () => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('error')), 100);
      });
    });

    const result = await hook.promise(42, 41);
    expect(result).toMatchObject([83, 1, new Error('error')]);
  });
});
