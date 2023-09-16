export function deepClone(target) {
	// 通过原型对象获取对象类型
	const type = Object.prototype.toString.call(target);
	let source;

	if (type === "[object Array]") {
		// 数组
		source = [];
		if (target.length > 0) {
			for (let i = 0; i < target.length; i++) {
				source.push(deepClone(target[i]));
			}
		}
	} else if (type === "[object Object]") {
		// 对象
		source = {};
		for (const i in target) {
			if (Object.prototype.hasOwnProperty.call(target, i)) {
				source[i] = deepClone(target[i]);
			}
		}
	} else {
		// 基本类型和方法可以直接赋值
		source = target;
	}

	return source;
}
