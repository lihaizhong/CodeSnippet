import { compareAdaptor } from "./compare/levenshtein-distance";
var YouNeedSuggestion = /** @class */ (function () {
    function YouNeedSuggestion(dataSource, options) {
        this.options = {
            // 进行匹配的字段
            keyNameList: ["text"],
            // 是否过滤空值
            filterEmptyValue: true,
            // 是否区分大小写
            caseSensitive: false,
            // 最小相似度
            minSimilarity: 0,
            // 计算算法
            compare: compareAdaptor(),
        };
        Object.assign(this.options, options);
        this.dataSource = dataSource;
        this.keyNameList = this.parseKeyNameList(this.options.keyNameList);
    }
    YouNeedSuggestion.prototype.parseValue = function (value) {
        var caseSensitive = this.options.caseSensitive;
        if (typeof value !== "string") {
            return "";
        }
        // 不区分大小写时，需要将字符串转换为小写
        return caseSensitive ? value : value.toLowerCase();
    };
    YouNeedSuggestion.prototype.parseKeyNameList = function (keyNameList) {
        if (typeof keyNameList === "string") {
            return keyNameList.split(",");
        }
        if (Array.isArray(keyNameList)) {
            return keyNameList;
        }
        return ["value"];
    };
    YouNeedSuggestion.prototype.getMaxSimilarity = function (value, match) {
        var _this = this;
        if (typeof value === "string" &&
            value === "" &&
            this.options.filterEmptyValue) {
            return 100;
        }
        if (typeof match === "string") {
            return this.options.compare(this.parseValue(match), value);
        }
        return this.keyNameList.reduce(function (lastSimilarity, key) {
            var sourceStr = _this.parseValue(match[key]);
            var currentSimilarity = _this.options.compare(sourceStr, value);
            return Math.max(lastSimilarity, currentSimilarity);
        }, Number.NEGATIVE_INFINITY);
    };
    YouNeedSuggestion.prototype.get = function (val) {
        var result = [];
        var value = this.parseValue(val);
        for (var i = 0; i < this.dataSource.length; i++) {
            var match = this.dataSource[i];
            var similarity = this.getMaxSimilarity(value, match);
            if (similarity >= this.options.minSimilarity) {
                result.push({ data: match, similarity: similarity });
            }
        }
        return result.sort(function (a, b) {
            return b.similarity - a.similarity;
        });
    };
    return YouNeedSuggestion;
}());
export { YouNeedSuggestion };
//# sourceMappingURL=index.js.map