/**
 * 生成唯一标识工具
 */
export class UniqueIdentity {
	private readonly LowercaseLetters = "abcdefghigklmnopqrstuvwxyz";

	private readonly CapitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	private readonly NumericalConstants = "0123456789";

	private readonly SpecialSymbols = "!@#$%^&*-_";

	/**
	 * 生成获得随机数因子
	 */
	private toRandomSeed(seeds: string): string {
		const length: number = seeds.length;
		const code: number = Math.floor(Math.random() * length);
		const s: string = seeds[code];

		// 检查是否为有效值
		if (seeds.includes(s)) {
			return s;
		}

		// 递归的方式获取有效值
		return this.toRandomSeed(seeds);
	}

	/**
	 * 生成随机的唯一标识
	 * @param length
	 * @returns
	 */
	private generateByRandom(length: number): string {
		const seeds: string =
			this.LowercaseLetters +
			this.CapitalLetters +
			this.NumericalConstants +
			this.SpecialSymbols;
		let uid = "";

		for (let i = 0; i < length; i++) {
			uid += this.toRandomSeed(seeds);
		}

		return uid;
	}

	/**
	 * 生成指定格式的唯一标识，使用U/u作为占位符
	 * @param format
	 * @returns
	 */
	private generateByFormat(format: string): string {
		const seeds: string = this.LowercaseLetters + this.CapitalLetters;
		let uid = "";

		for (let i = 0; i < format.length; i++) {
			const char: string = format.charAt(i);

			uid += char.toUpperCase() === "U" ? this.toRandomSeed(seeds) : char;
		}

		return uid;
	}

	/**
	 * 生成唯一标识
	 */
	generate(format?: string): string;
	generate(length?: number): string;
	generate(value?: string | number): string {
		if (typeof value === "number") {
			return this.generateByRandom(value);
		}

		if (typeof value === "string" && value !== "") {
			return this.generateByFormat(value);
		}

		return this.generateByRandom(16);
	}

	/**
	 * 随机获取唯一标识
	 */
	generateRandom(): string {
		if ("crypto" in window && typeof crypto.randomUUID === "function") {
			return crypto.randomUUID();
		}

		return this.generate();
	}
}
