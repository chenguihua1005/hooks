const deprecate = (fn: () => void, message: string) => {
  console.warn(message);
  fn();
};

export { deprecate };
