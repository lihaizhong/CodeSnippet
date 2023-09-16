/**
 * 数据去重
 * @param {array<any>} target
 * @param {array<any>} source
 * @param {function} equal
 */
function removeDuplicates(target = [], source = [], equal = () => true) {
	const targetLength = target.length;
	const sourceLength = source.length;

	if (!targetLength) {
		return [];
	}

	if (!sourceLength) {
		return [...target];
	}

	return target.filter((targetItem) =>
		source.every((sourceItem) => !equal(targetItem, sourceItem)),
	);
}

export class CaptureDataList {
	constructor(options) {
		this.options = Object.assign(
			{
				preSize: 50,
				onCompare: (target, source) => target === source,
				transform: null,
			},
			options,
		);

		this.init();
	}

	init() {
		this.usedDataList = [];
		this.datalist = [];
	}

	input(list = []) {
		if (Array.isArray(list) && list.length) {
			const { onCompare } = this.options;
			const uniqueList1 = removeDuplicates(list, this.usedDataList, onCompare);
			const uniqueList2 = removeDuplicates(
				uniqueList1,
				this.datalist,
				onCompare,
			);
			this.datalist.push(...uniqueList2);
		}
	}

	output() {
		const list = this.datalist.splice(0, this.options.preSize);
		const { transform } = this.options;
		let promise = null;

		if (typeof transform === "function") {
			promise = transform(list);
		}

		if (!(promise instanceof Promise)) {
			promise = Promise.resolve(list);
		}

		return promise.then((columns) => {
			this.usedDataList.push(...columns);
			return columns;
		});
	}

	hasUnused() {
		return !!this.datalist.length;
	}
}
