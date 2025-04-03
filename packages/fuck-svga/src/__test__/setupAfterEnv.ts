jest.mock('../benchmark', () => {
  const noop = () => {};

  return {
    count: 0,
    label: noop,
    time: noop,
    line: noop,
    log: noop,
  }
});
