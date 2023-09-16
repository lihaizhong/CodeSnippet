export interface DistanceWeightOptions {
	// 最大的匹配词长度权重
	continuous: number;
	// 匹配词总个数权重
	count: number;
	// 首个匹配字符的位置权重
	position: number;
	// 最短编辑路径权重
	distance: number;
}

export class DistanceCalculator {
	// 最大的匹配词长度
	private continuous: number;
	// 匹配词总个数
	private count: number;
	// 首个匹配字符的位置
	private position: number;
	// 最短编辑距离
	private distance: number;
	// 权重计算配置项
	private options: DistanceWeightOptions = {
		continuous: 0.3,
		count: 0.2,
		position: 0.1,
		distance: 0.4,
	};

	constructor(options?: DistanceWeightOptions) {
		Object.assign(this.options, options);
	}

	private initialize(position: number): void {
		this.continuous = 0;
		this.count = 0;
		this.position = position;
		this.distance = -1;
	}

	private setContinuous(continuous: number): void {
		if (this.continuous < continuous) {
			this.continuous = continuous;
		}
	}

	private setCount(count: number): void {
		this.count = count;
	}

	private setPosition(position: number): void {
		this.position = position;
	}

	private setDistance(distance: number): void {
		this.distance = distance;
	}

	private calc(sourceLength: number, targetLength: number): number {
		const { continuous, count, position, distance, options } = this;

		return (
			(1 - distance / Math.max(sourceLength, targetLength)) * options.distance +
			(1 - position / targetLength) * options.position +
			(continuous / targetLength) * options.continuous +
			(count / targetLength) * options.count
		);
	}

	get(inputValue: string, comparedValue: string): number {
		const sourceLength: number = inputValue.length;
		const targetLength: number = comparedValue.length;
		const space: number[] = new Array(targetLength);

		this.initialize(targetLength - 1);

		// 过滤目标或者比较值为空字符串的情况
		if (sourceLength === 0) {
			this.setDistance(targetLength);
		} else if (targetLength === 0) {
			this.setDistance(sourceLength);
		} else {
			// 保存所有匹配到的字符的index
			const matchPositionList: number[] = [];
			// 连续字符长度
			let continuous = 0;
			// 0 为不需要做增删改的操作，1 为需要做增删改操作
			let modifyNum = 0;

			for (let row = 0; row < sourceLength; row++) {
				const sourceChar: string = inputValue[row];
				let temp: number = row;
				let matchIndex = -1;

				for (let col = 0; col < targetLength; col++) {
					const targetChar: string = comparedValue[col];
					// 前一个编辑距离
					const prevDistance: number = col === 0 ? row + 1 : space[col - 1];
					// 上一个编辑距离
					const topDistance: number =
						space[col] === undefined ? col + 1 : space[col];

					if (sourceChar === targetChar) {
						modifyNum = 0;

						// 解决重复匹配的问题
						if (matchIndex === -1 && !matchPositionList.includes(col)) {
							matchIndex = col;
						}

						// 设置首位匹配到的字符
						if (this.position === targetLength) {
							this.setPosition(col);
						}
					} else {
						modifyNum = 1;
					}

					// 获取增，删，改和不变得到的最小值
					const min: number = Math.min(
						prevDistance + 1,
						topDistance + 1,
						temp + modifyNum,
					);

					// 保存左上角的数据，计算最小值时需要用到
					temp = topDistance;
					space[col] = min;
				}

				// 如果匹配到了结果
				if (matchIndex !== -1) {
					if (
						row > 0 &&
						matchIndex > 0 &&
						inputValue[row - 1] === comparedValue[matchIndex - 1]
					) {
						if (continuous === 0) {
							continuous = 2;
						} else {
							continuous++;
						}
					} else if (continuous === 0) {
						continuous++;
					} else {
						// 设置最长的连续字符
						this.setContinuous(continuous);
						continuous = 1;
					}

					matchPositionList.push(matchIndex);
				} else {
					// 设置最长的连续字符
					this.setContinuous(continuous);
					continuous = 0;
				}
			}

			// 设置最长的连续字符
			this.setContinuous(continuous);
			// 设置匹配到的数量
			this.setCount(matchPositionList.length);
			// 设置编辑距离
			this.setDistance(space[targetLength - 1]);
		}

		return this.calc(inputValue.length, comparedValue.length);
	}
}

export const compareAdaptor =
	(options?: DistanceWeightOptions) =>
	(inputValue: string, comparedValue: string) =>
		new DistanceCalculator(options).get(inputValue, comparedValue);
