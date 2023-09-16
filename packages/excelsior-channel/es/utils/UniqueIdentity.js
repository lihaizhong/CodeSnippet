/**
 * 生成唯一标识工具
 */
var UniqueIdentity = /** @class */ (function () {
    function UniqueIdentity() {
        this.LowercaseLetters = "abcdefghigklmnopqrstuvwxyz";
        this.CapitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.NumericalConstants = "0123456789";
        this.SpecialSymbols = "!@#$%^&*-_";
    }
    /**
     * 生成获得随机数因子
     */
    UniqueIdentity.prototype.toRandomSeed = function (seeds) {
        var length = seeds.length;
        var code = Math.floor(Math.random() * length);
        var s = seeds[code];
        // 检查是否为有效值
        if (seeds.includes(s)) {
            return s;
        }
        // 递归的方式获取有效值
        return this.toRandomSeed(seeds);
    };
    /**
     * 生成随机的唯一标识
     * @param length
     * @returns
     */
    UniqueIdentity.prototype.generateByRandom = function (length) {
        var seeds = this.LowercaseLetters +
            this.CapitalLetters +
            this.NumericalConstants +
            this.SpecialSymbols;
        var uid = "";
        for (var i = 0; i < length; i++) {
            uid += this.toRandomSeed(seeds);
        }
        return uid;
    };
    /**
     * 生成指定格式的唯一标识，使用U/u作为占位符
     * @param format
     * @returns
     */
    UniqueIdentity.prototype.generateByFormat = function (format) {
        var seeds = this.LowercaseLetters + this.CapitalLetters;
        var uid = "";
        for (var i = 0; i < format.length; i++) {
            var char = format.charAt(i);
            uid += char.toUpperCase() === "U" ? this.toRandomSeed(seeds) : char;
        }
        return uid;
    };
    UniqueIdentity.prototype.generate = function (value) {
        if (typeof value === "number") {
            return this.generateByRandom(value);
        }
        if (typeof value === "string" && value !== "") {
            return this.generateByFormat(value);
        }
        return this.generateByRandom(16);
    };
    /**
     * 随机获取唯一标识
     */
    UniqueIdentity.prototype.generateRandom = function () {
        if ("crypto" in window && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        return this.generate();
    };
    return UniqueIdentity;
}());
export { UniqueIdentity };
//# sourceMappingURL=UniqueIdentity.js.map