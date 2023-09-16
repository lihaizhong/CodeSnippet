/**
 * CommonJS规范
 * - 每个文件就是一个模块，称之为module，所有代码运行在模块作用域中，不会污染全局作用域；
 * - nodejs中的CommonJS模块加载采用同步加载方式，模块的加载顺序，按照其在代码中出现的顺序进行加载；
 * - 模块可以多次，第一次加载时会运行模块，模块输出结果会被缓存；再次加载时，会从缓存结果中读取输出模块；
 * - 通过require加载模块，通过exports或者module.exports输出模块；
 */
class Module {
	constructor() {
		this.exports = {};
	}

	static _cache = {};

	static _load(request, parent, isMain) {
		// 1. 计算绝对路径
		// 2. 查询缓存（如果有，直接返回）
		// 3. 判断是否是内置模块（如果是，直接返回）
		// 4. 生成模块实例，存入缓存
		// 5. 加载模块
		// 6. 输出模块的exports属性
	}

	load(filename) {}
}

/**
 * 引入模块的方法
 * 加载文件类型：
 * - 核心模块
 * - 文件模块
 * - 第三方自定义模块
 */
function require() {}

/**
 * 查找规则：
 * - 在当前目录下的node_modules目录查找
 * - 在父祖级目录的node_modules查找
 * - 沿着路径向上递归，直到根目录下的node_modules目录
 * - 在查找过程中，会找package.json下main属性指向的文件，如果没有package.json，在node环境下会查找index.js/index.json/index.node
 */
require.resolve = function resolve() {};

function runInThisContext(moduleFunction) {
	return (module, exports, require, __filename, __dirname) => {};
}
