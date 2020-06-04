import { AsyncSeriesHook } from '../src/AsyncSeriesHook';
describe('AsyncSeriesHook', () => {
  it('should not have call method', () => {
    const hook = new AsyncSeriesHook();
    expect(hook.call).toEqual(undefined);
    expect(typeof hook.callAsync).toEqual('function');
    expect(typeof hook.promise).toEqual('function');
  });

  it('should have tap method', done => {
    const hook = new AsyncSeriesHook();
    const mockTap = jest.fn();
    hook.tap('somePlugin', mockTap);
    hook.callAsync(() => done());
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  it.only('should have promise method', done => {
    const hook = new AsyncSeriesHook();
    const mockTap = jest.fn();
    hook.tap('somePlugin', mockTap);
    hook.promise().then(() => done());
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  // it('should have to correct behavior', async () => {
  //   const tester = new HookTester(args => new AsyncSeriesHook(args));

  //   const result = await tester.run();

  //   expect(result).toMatchSnapshot();
  // });
});
