/**
 * async函数的实现
 *
 * 1. async函数是Generator函数的语法糖，等同于自执行的Generator函数。
 * 2. async函数返回一个新的Promise对象。
 */

function asyncToGeneratorNext(gen, resolve, reject, _next, _throw, key, arg) {
	try {
		// 获取generator对象
		const info = gen[key](arg);

		if (info.done) {
			// 完成所有断点时，执行成功操作
			resolve(info.value);
		} else {
			// 递归调用断点，使用Promise，保持断点的连贯性
			Promise.resolve(info.value).then(_next, _throw);
		}
	} catch (e) {
		// 某个断点报错时，执行失败操作
		reject(e);
	}
}

export default function asyncToGenerator(fn) {
	return function (...args) {
		return new Promise((resolve, reject) => {
			const gen = fn.apply(this, args);
			const _next = (value) =>
				asyncToGeneratorNext(
					gen,
					resolve,
					reject,
					_next,
					_throw,
					"next",
					value,
				);
			const _throw = (error) =>
				asyncToGeneratorNext(
					gen,
					resolve,
					reject,
					_next,
					_throw,
					"throw",
					error,
				);

			_next();
		});
	};
}
