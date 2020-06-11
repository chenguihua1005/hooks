import { AsyncParallelHook } from '../src/AsyncParallelHook';

describe('AsyncParallelHook', () => {
  it('should pass all values', async () => {
    const hook = new AsyncParallelHook();

    hook.tapPromise('addition', (num1, num2) => {
      return new Promise(resolve =>
        setTimeout(resolve.bind(null, num1 + num2), 100)
      );
    });
    hook.tapPromise('substraction', (num1, num2) => {
      return new Promise(resolve => {
        setTimeout(() => resolve(num1 - num2), 100);
      });
    });

    const result = await hook.promise(42, 41);
    expect(result).toMatchObject([83, 1]);
  });

  it('should throw error', async () => {
    const hook = new AsyncParallelHook();
    hook.tapPromise('add 1', arg => {
      return arg + 1;
    });
    hook.tapPromise('add 2', arg => {
      return arg + 2;
    });

    hook.tapPromise('throw error', _ => {
      throw new Error('error');
    });

    try {
      await hook.promise(42);
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });

  it('should throw error promise', async () => {
    const hook = new AsyncParallelHook();

    hook.tapPromise('addition', (num1, num2) => {
      return new Promise(resolve =>
        setTimeout(() => resolve(num1 + num2), 100)
      );
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

    try {
      await hook.promise(42, 41);
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });
});
