function reduceOptions(options, defaultValue) {
	return Object.keys(options).reduce((acc, key) => {
		const value = options[key];
		if (value) {
			return `${acc},${key}_${value}`;
		}

		return acc;
	}, defaultValue);
}

/**
 * 处理OSS图片
 * @param {string} url
 * @param {object} options
 * @property {string} m lfit、mfit、fill、pad、fixed，默认为 lfit。
 * @property {number} w 1-4096
 * @property {number} h 1-4096
 * @property {number} x 1-4096
 * @property {number} y 1-4096
 * @property {number} limit 0/1, 默认是 1
 * @property {string} color [000000-FFFFFF]
 * @param {string} format 支持：jpg, png, webp, bmp, gif, tiff
 *
 * https://help.aliyun.com/document_detail/44688.html?spm=a2c4g.11186623.6.1314.46e21729yRtkXO
 */

export class OSSImageHandler {
	constructor(url, options = {}) {
		if (typeof url === "string" && url !== "") {
			this.url = `${url.replace(/\?.*/, "")}?x-oss-process=image/format,webp`;
		} else {
			this.url = "";
		}

		this.ossOptions = Object.assign({ watermarks: {} }, options);
	}

	_jointTogether(callback) {
		this.url && callback();
		return this;
	}

	resize(options) {
		return this._jointTogether(() => {
			const opts = Object.assign({}, options);
			this.url += reduceOptions(opts, "/resize");
		});
	}

	watermark(type) {
		return this._jointTogether(() => {
			const WATERMARK =
				this.ossOptions.watermarks[type] || this.ossOptions.watermarks.default;
			this.url += `/watermark,image_${WATERMARK},g_se,x_5,y_5`;
		});
	}

	crop(options) {
		return this._jointTogether(() => {
			const opts = Object.assign({ g: "center" }, options);
			this.url += reduceOptions(opts, "/crop");
		});
	}

	done() {
		return this.url;
	}
}
