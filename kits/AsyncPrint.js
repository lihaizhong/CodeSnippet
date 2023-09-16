// CSS 默认样式
const printTemplateDefaultStyle = `
* {
  margin: 0;
  padding: 0;
}

html, body {
  font-size: 12pt;
  color: #000;
}

table {
  width: 100%;
  border-collapse: collapse;
  caption-side: top;
  empty-cells: show;
}

table th,
table td {
  padding: 8pt 0;
  text-align: left;
}

caption {
  width: 100%;
  padding: 8pt 0;
  text-align: left;
  border: none;
  border-bottom: 1pt solid #000;
}

@media screen {
  section {
    border: 1pt dashed #666;
    padding: 14mm 12mm 10mm;
  }
}

@media print {
  @page A4 {
    size: 210mm 290mm;
    margin: 20mm 15mm;
  }

  section {
    page: A4;
    page-break-after: always;
  }
}

article.print-wrapper {
  margin: 20pt auto;
}
`;

// CSS工具样式
const getTemplateToolStyle = `
.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-middle {
  vertical-align: middle;
}

.text-baseline {
  vertical-align: baseline;
}

.font-bold {
  font-weight: bold;
}

.font-normal {
  font-weight: normal;
}

.border {
  border: 1pt solid #000;
}

.border-top {
  border-top: 1pt solid #000;
}

.border-right {
  border-right: 1pt solid #000;
}

.border-bottom {
  border-bottom: 1pt solid #000;
}

.border-left {
  border-left: 1pt solid #000;
}

.no-border {
  border: none;
}

.clearfix::after {
  content: '';
  clear: both;
  display: block;
  height: 0;
  font-size: 0;
  display: block;
}

.clearfix {
  zoom: 1;
}

.fl {
  float: left;
}

.fr {
  float: right;
}
`;

/**
 * 创建模板
 * @param {string} body
 * @param {object} options
 *
 * 注：
 * 1. section是关键标签，用来表示A4纸张，请谨慎使用
 * 2. table，caption都做过处理，可以直接使用而不去设置额外样式
 * 3. 请使用pt作为单位，因为打印设备真正识别的单位为pt
 */
function getPrintTemplate(body = "", options = {}) {
	return `
    <!DOCTYPE html>

    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <meta name="robots" content="none">
        <meta name="renderer" content="webkit">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
        <meta http-equiv="cache-control" content="no-cache">
        <meta http-equiv="Cache-Control" content="no-siteapp" />
        <meta http-equiv="expires" content="Tue Jan 07 2020 11:19:57 GMT+0800" />
        <title>${options.title}</title>
        <style>${printTemplateDefaultStyle}</style>
        <style>${getTemplateToolStyle}</style>
      </head>

      <body>
          <article class="print-wrapper" style="width: ${options.width};">
            ${body}
          </article>
      </body>
    </html>
  `;
}

function getCommonHandles(opener) {
	return {
		insertStyle(cssText) {
			if (cssText) {
				const $styleElem = document.createElement("style");
				if ($styleElem.styleSheet) {
					// IE
					$styleElem.type = "text/css";
					const func = () => {
						// 防止IE中stylesheet数量超过限制而发生错误
						$styleElem.styleSheet.cssText = cssText;
					};
					// 如果当前styleSheet还不能用，则放到异步中则行
					if ($styleElem.styleSheet.disabled) {
						setTimeout(func, 0);
					} else {
						func();
					}
				} else {
					// w3c浏览器中只要创建文本节点插入到style元素中就行了
					const $textNode = document.createTextNode(cssText);
					$styleElem.appendChild($textNode);
				}
				opener.document.head.appendChild($styleElem);
			}
		},
		close() {
			if (!opener.closed) {
				opener.close();
			}
		},
		print() {
			if (!opener.closed) {
				opener.print();
			}
		},
	};
}

const handlers = {
	createNewPrintWindow() {
		// 打印页窗口句柄
		const opener = window.open("", "_blank");
		// 提示等待信息
		opener.document.body.innerHTML =
			'<div style="text-align: center; margin: 40px 0;">正在调取打印数据，请稍等...</div>';

		opener.$handle = getCommonHandles(opener);

		return opener;
	},

	createNewPrintFrame() {
		// 打印页iframe
		const $iframe = document.createElement("iframe");
		// 设置iframe的链接
		$iframe.setAttribute("src", "about:blank");
		// 调整frame样式
		$iframe.setAttribute(
			"style",
			"position: absolute; left: -100000px; top: -10000px; z-index: 0; width: 200px; height: 200px;",
		);
		// 将iframe插入到document中
		document.body.appendChild($iframe);
		// 获取窗口句柄
		const opener = $iframe.contentWindow;
		opener.$handle = Object.assign(getCommonHandles(opener), {
			close() {
				document.body.removeChild($iframe);
			},
		});

		return opener;
	},
};

const handlerMinor = {
	win: "window",
	frame: "iframe",
};

export class AsyncPrint {
	/**
	 * options参数见底部print方法
	 * @param {object} options
	 */
	constructor(options = {}) {
		this.opener = null;
		this._options = Object.assign(
			{
				title: "打印页",
				width: "210mm",
				delay: 50,
				handler: handlerMinor.frame,
			},
			options,
		);

		if (this._options.debug) {
			this._options = Object.assign(this._options, {
				handler: handlerMinor.win,
			});
		}

		this._create();

		if (this._options.body) {
			this.exec();
		}
	}

	_create() {
		const handlerType = this._options.handler;

		switch (handlerType) {
			case handlerMinor.win:
				this.opener = handlers.createNewPrintWindow();
				break;
			case handlerMinor.frame:
				this.opener = handlers.createNewPrintFrame();
				break;
			default:
				throw new Error(`未知句柄类型： ${handlerType}`);
		}
	}

	exec(body = "") {
		const { opener, _options: options } = this;

		if (body) {
			options.body = body;
		}

		if (!options.body) {
			this.close();
			return false;
		}

		// 生成HTML字符串模板
		const html = getPrintTemplate(options.body, options);
		// 将字符串模板渲染到新窗口中
		opener.document.write(html);

		// 触发打印前的回调函数
		opener.onbeforeprint = () => {
			opener.focus();
			if (typeof options.beforeprint === "function") {
				options.beforeprint(opener);
			}
		};

		// 触发打印后的回调函数（默认是关闭新窗口）
		opener.onafterprint = () => {
			let autoClose = true;

			if (typeof opener.afterprint === "function") {
				autoClose = options.afterprint(opener);
			}

			// 判断是否自动关闭
			if (autoClose !== false) {
				this.close();
			}
		};

		// 插入额外的样式
		opener.$handle.insertStyle(options.extraCSS);

		if (!options.debug) {
			// 延迟调用打印接口
			setTimeout(opener.$handle.print, options.delay);
		}

		return true;
	}

	/**
	 * 关闭打印页面
	 */
	close() {
		if (!this.opener.closed) {
			this.opener.$handle.close();
		}
	}
}

/**
 * 同步打印工具方法
 * @param {object} options 打印配置项
 * @property {string} title 标签标题(默认是打印页)
 * @property {string} body 打印内容
 * @property {string} extraCSS 额外的样式信息
 * @property {string} width 内容宽度（默认是210mm）
 * @property {string} delay 延迟打印（默认是50ms）
 * @property {string} handler 打印处理模式（默认是iframe）
 * @property {boolean} debug 调试模式（默认是false）
 * @property {function} beforeprint 打印前调用的函数 参数 opener 窗口对象
 * @property {function} afterprint 打印后调用的函数 参数 opener 窗口对象
 * @returns {AsyncPrint} AsyncPrint实例
 * @function exec 执行打印操作
 * @param {string} body 打印的内容
 * @function close 关闭打印窗口
 *
 * * 注：
 * 1. section是关键标签，用来表示A4纸张，请谨慎使用
 * 2. table，caption都做过处理，可以直接使用而不去设置额外样式
 * 3. 请使用pt作为单位，因为打印设备真正识别的单位为pt
 * 4. 打印的公共样式可以查看 getTemplateToolStyle 变量
 */
export function print(options = {}) {
	return new AsyncPrint(options);
}
