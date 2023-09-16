// const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const stopwatch = {
  // a: {} as Record<string, number>,
  l: {} as Record<string, boolean>,
  t: {} as Record<string, number>,
  increment(label: string) {
    if (stopwatch.t[label] === undefined) {
      stopwatch.t[label] = 0;
    }

    stopwatch.t[label]++;
  },
  getCount(label: string): number {
    return stopwatch.t[label] || 0;
  },
  time(label: string): void {
    console.time?.(label);
  },
  timeEnd(label: string): void {
    console.timeEnd?.(label);
  },
  clearTime(label: string): void {
    delete stopwatch.t[label];
  },
  isLock(label: string) {
    return !!stopwatch.l[label];
  },
  lock(label: string) {
    stopwatch.l[label] = true;
  },
  unlock(label: string): void {
    delete stopwatch.l[label];
  },
};

export default {
  count: 20,
  label(label: string) {
    console.log(label);
  },
  time(
    label: string,
    callback: (count: number) => void,
    beforeCallback?: ((count: number) => void) | null,
    afterCallback?: ((count: number) => void) | null
  ): void {
    stopwatch.increment(label);

    const count = stopwatch.getCount(label);
    if (stopwatch.isLock(label) || (this.count !== 0 && count > this.count)) {
      callback(count);
    } else {
      beforeCallback?.(count);
      stopwatch.time(label);
      callback(count);
      stopwatch.timeEnd(label);
      afterCallback?.(count);
    }
  },
  clearTime(label: string) {
    stopwatch.clearTime(label);
  },
  lockTime(label: string) {
    stopwatch.lock(label);
  },
  unlockTime(label: string) {
    stopwatch.unlock(label);
  },
  line(size: number = 40) {
    console.log("-".repeat(size));
  },
  log(...message: any[]) {
    console.log("【benchmark】", ...message);
  },
};
