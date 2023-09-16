/**
 * 校验中国居民身份证号码
 * @param {string} code
 * @returns {boolean}
 *
 * @description
 * 11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江'
 * 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南',
 * 42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州'
 * 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾'
 * 81: '香港', 82: '澳门', 91: '国外'
 */
export function IdCardValidator(code: string): boolean {
	const city: ReadonlyArray<number> = [
		11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44,
		45, 46, 50, 51, 52, 53, 54, 61, 62, 63, 64, 65, 71, 81, 82, 91,
	];
	const reg: RegExp =
		/(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/i;

	// 保证格式正确
	if (!code || !reg.test(code)) {
		return false;
	}

	// 保证省份存在
	if (!city.includes(+code.substring(0, 2))) {
		return false;
	}

	// 保证算法正确
	if (code.length === 18) {
		const codeArr: string[] = code.split("");
		const factor: ReadonlyArray<number> = [
			7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2,
		];
		const parity: ReadonlyArray<string | number> = [
			1,
			0,
			"X",
			9,
			8,
			7,
			6,
			5,
			4,
			3,
			2,
		];
		let sum = 0;
		let ai = 0;
		let wi = 0;

		for (let i = 0; i < 17; i++) {
			ai = +codeArr[i];
			wi = factor[i];
			sum += ai * wi;
		}

		if (String(parity[sum % 11]).toUpperCase() !== code[17]) {
			return false;
		}
	}

	return true;
}
