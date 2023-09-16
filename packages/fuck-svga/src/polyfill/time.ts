export const now = () => {
  // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
  if (typeof performance !== "undefined") {
    return performance.now();
  }

  return Date.now();
};
