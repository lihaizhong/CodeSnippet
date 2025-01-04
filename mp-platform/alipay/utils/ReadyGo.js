export default class ReadyGo {
  isReady;
  list;

  constructor() {
    this.isReady = false;
    this.list = new Set();
  }

  has() {
    return this.list.length !== 0
  }

  ready(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.list.add(callback);
    }
  }

  go() {
    this.isReady = true;
    this.list.forEach((callback) => callback());
    this.list = new Set();
  }

  reset() {
    this.isReady = false;
    this.list = new Set();
  }
}
