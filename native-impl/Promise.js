/**
 * Promise实现
 * 英文原版网址：https://promisesaplus.com/
 * 中文翻译网址：https://www.ituring.com.cn/article/66566
 */

/**
 * 状态枚举
 */
const PROMISE_STATUS = {
	/**
	 * 需满足条件：
	 * - 可以迁移至执行态或者拒绝态
	 */
	PENDING: "PENDING",
	/**
	 * 需满足条件：
	 * - 不能迁移至其他任何状态
	 * - 必须拥有一个`不可变`的终值
	 */
	FULFILLED: "FULFILLED",
	/**
	 * 需满足条件：
	 * - 不能迁移至其他任何状态
	 * - 必须拥有一个`不可变`的据因
	 */
	REJECTED: "REJECTED",
};

/**
 * 判断是否是一个`thenable`对象
 * @param {any} val
 * @return {boolean}
 */
function isThenable(val) {
	return (
		((val !== null && typeof val === "object") || typeof val === "function") &&
		typeof val.then === "function"
	);
}

/**
 * 异步任务
 * @param {function} fn
 */
function nextTick(fn) {
	// 完成宏任务处理
	setTimeout(fn, 0);
}

/**
 * 清空执行函数
 * @params fns
 * @params value
 */
function flushSchedulerQueue(fns, value) {
	let fn;

	// rome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((fn = fns.shift())) {
		fn(value);
	}
}

/**
 * Promise实现
 */
export default class IPromise {
	static all(promises) {
		return promises.reduce(
			(acc, promise) =>
				acc.then((values) => {
					if (promise instanceof IPromise) {
						return promise.then((value) => values.concat([value]));
					}

					return IPromise.resolve(promise);
				}),
			IPromise.resolve([]),
		);
	}

	static race(promises) {
		return new IPromise((resolve, reject) => {
			for (const promise of promises) {
				promise.then(resolve, reject);
			}
		});
	}

	/**
	 * 静态成功操作
	 * @param {Function | isThenable} value
	 * @return {Promise}
	 */
	static resolve(value) {
		if (isThenable(value)) return value;
		return new IPromise((resolve) => resolve(value));
	}

	/**
	 * 静态失败操作
	 * @param {any} error
	 * @return {Promise}
	 */
	static reject(error) {
		if (isThenable(error)) return error;
		return new IPromise((resolve, reject) => reject(error));
	}

	/**
	 * 构造函数
	 * @param {Function} resolver
	 */
	constructor(resolver) {
		if (typeof resolver !== "function") {
			throw new TypeError("Promise resolver undefined is not a function");
		}

		this._status = PROMISE_STATUS.PENDING;
		this._value = null;
		this._fulfilledQueues = [];
		this._rejectedQueues = [];

		try {
			// 处理回调函数
			resolver(this._resolve.bind(this), this._reject.bind(this));
		} catch (ex) {
			this._reject(ex);
		}
	}

	/**
	 * 成功操作
	 * @param {Function | Thenable} val
	 */
	_resolve(val) {
		if (this._status !== PROMISE_STATUS.PENDING) return;

		const run = () => {
			const onFulfilled = (value) =>
				flushSchedulerQueue(this._fulfilledQueues, value);
			const onRejected = (error) =>
				flushSchedulerQueue(this._rejectedQueues, error);

			if (isThenable(val)) {
				val.then(
					(value) => {
						this._status = PROMISE_STATUS.FULFILLED;
						this._value = value;
						onFulfilled(value);
					},
					(error) => {
						this._status = PROMISE_STATUS.REJECTED;
						this._value = error;
						onRejected(error);
					},
				);
			} else {
				this._status = PROMISE_STATUS.FULFILLED;
				this._value = val;
				onFulfilled(val);
			}
		};

		nextTick(run);
	}

	/**
	 * 失败操作
	 * @param {any} error
	 */
	_reject(error) {
		if (this._status !== PROMISE_STATUS.PENDING) return;

		const run = () => {
			this._status = PROMISE_STATUS.REJECTED;

			this._value = error;

			let cb = this._rejectedQueues.shift();

			while (cb) {
				cb(error);
				cb = this._rejectedQueues.shift();
			}
		};

		nextTick(run);
	}

	/**
	 * Promise then 方法
	 * @param {function} onFulfilled optional
	 * @param {function} onRejected optional
	 * @return {Promise}
	 */
	// biome-ignore lint/suspicious/noThenProperty: <explanation>
	then(onFulfilled, onRejected) {
		const { _value, _status } = this;

		return new this.constructor((resolveNext, rejectedNext) => {
			const fulfilled = (value) => {
				try {
					if (typeof onFulfilled !== "function") {
						resolveNext(value);
					} else {
						const res = onFulfilled(value);

						if (isThenable(res)) {
							res.then(resolveNext, rejectedNext);
						} else {
							resolveNext(res);
						}
					}
				} catch (ex) {
					rejectedNext(ex);
				}
			};

			const rejected = (err) => {
				try {
					if (typeof onRejected !== "function") {
						rejectedNext(err);
					} else {
						const res = onRejected(err);

						if (isThenable(res)) {
							res.then(resolveNext, rejectedNext);
						} else {
							resolveNext(res);
						}
					}
				} catch (ex) {
					rejectedNext(ex);
				}
			};

			switch (_status) {
				case PROMISE_STATUS.PENDING:
					this._fulfilledQueues.push(onFulfilled);
					this._rejectedQueues.push(onRejected);
					break;
				case PROMISE_STATUS.FULFILLED:
					fulfilled(_value);
					break;
				case PROMISE_STATUS.REJECTED:
					rejected(_value);
					break;
			}
		});
	}

	/**
	 * Promise catch 方法（then的语法糖）
	 * @param {function} onRejected
	 * @return {Promise}
	 */
	catch(onRejected) {
		return this.then(null, onRejected);
	}

	/**
	 * 成功或者失败都会执行的操作
	 * @param {Function} cb
	 * @return {Promise}
	 */
	finally(cb) {
		return this.then(
			(value) => this.constructor.resolve(cb()).then(() => value),
			(reason) =>
				this.constructor.resolve(cb()).then(() => {
					throw reason;
				}),
		);
	}
}
