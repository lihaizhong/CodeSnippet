const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const stopwatch = {
  a: {} as Record<string, number>,
  t: {} as Record<string, number>,
  time(label: string): void {
    // stopwatch.a[label] = now();
    console.time(label);
  },
  timeEnd(label: string): void {
    // const t = stopwatch.a[label];

    // delete stopwatch.a[label];
    // if (typeof t === "number") {
    //   console.log(`${label}: `, now() - t);
    // }
    console.timeEnd(label);
  },
  clearTime(label: string): void {
    delete stopwatch.t[label];
  },
};

export default {
  count: 20,
  label(label: string) {
    console.log(label);
  },
  time(
    label: string,
    callback: () => void,
    beforeCallback?: ((count: number) => void) | null,
    afterCallback?: ((count: number) => void) | null
  ): void {
    if (stopwatch.t[label] === undefined) {
      stopwatch.t[label] = 1;
    } else {
      stopwatch.t[label]++;
    }

    if (this.count !== 0 && stopwatch.t[label] > this.count) {
      callback();
    } else {
      beforeCallback?.(stopwatch.t[label]);
      stopwatch.time(label);
      callback();
      stopwatch.timeEnd(label);
      afterCallback?.(stopwatch.t[label]);
    }
  },
  clearTime(label: string) {
    stopwatch.clearTime(label);
  },
  line(size: number = 40) {
    console.log("-".repeat(size));
  },
};
