const timers: Record<string, number> = {};

export default {
  count: 20,
  time(label: string, callback: () => void): void {
    if (timers[label] === undefined) {
      timers[label] = 1;
    } else {
      timers[label]++;
    }

    if (this.count !== 0 && timers[label] > this.count) {
      callback();
    } else {
      console.time(label);
      callback();
      console.timeEnd(label);
    }
  },
  clearTime(label: string) {
    delete timers[label];
  },
  line(size: number = 30) {
    console.log('-'.repeat(size));
  }
};
