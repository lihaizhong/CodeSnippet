(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compareAdaptor = exports.DistanceCalculator = void 0;
    var DistanceCalculator = /** @class */ (function () {
        function DistanceCalculator(options) {
            // 权重计算配置项
            this.options = {
                continuous: 0.3,
                count: 0.2,
                position: 0.1,
                distance: 0.4,
            };
            Object.assign(this.options, options);
        }
        DistanceCalculator.prototype.initialize = function (position) {
            this.continuous = 0;
            this.count = 0;
            this.position = position;
            this.distance = -1;
        };
        DistanceCalculator.prototype.setContinuous = function (continuous) {
            if (this.continuous < continuous) {
                this.continuous = continuous;
            }
        };
        DistanceCalculator.prototype.setCount = function (count) {
            this.count = count;
        };
        DistanceCalculator.prototype.setPosition = function (position) {
            this.position = position;
        };
        DistanceCalculator.prototype.setDistance = function (distance) {
            this.distance = distance;
        };
        DistanceCalculator.prototype.calc = function (sourceLength, targetLength) {
            var _a = this, continuous = _a.continuous, count = _a.count, position = _a.position, distance = _a.distance, options = _a.options;
            return ((1 - distance / Math.max(sourceLength, targetLength)) * options.distance +
                (1 - position / targetLength) * options.position +
                (continuous / targetLength) * options.continuous +
                (count / targetLength) * options.count);
        };
        DistanceCalculator.prototype.get = function (inputValue, comparedValue) {
            var sourceLength = inputValue.length;
            var targetLength = comparedValue.length;
            var space = new Array(targetLength);
            this.initialize(targetLength - 1);
            // 过滤目标或者比较值为空字符串的情况
            if (sourceLength === 0) {
                this.setDistance(targetLength);
            }
            else if (targetLength === 0) {
                this.setDistance(sourceLength);
            }
            else {
                // 保存所有匹配到的字符的index
                var matchPositionList = [];
                // 连续字符长度
                var continuous = 0;
                // 0 为不需要做增删改的操作，1 为需要做增删改操作
                var modifyNum = 0;
                for (var row = 0; row < sourceLength; row++) {
                    var sourceChar = inputValue[row];
                    var temp = row;
                    var matchIndex = -1;
                    for (var col = 0; col < targetLength; col++) {
                        var targetChar = comparedValue[col];
                        // 前一个编辑距离
                        var prevDistance = col === 0 ? row + 1 : space[col - 1];
                        // 上一个编辑距离
                        var topDistance = space[col] === undefined ? col + 1 : space[col];
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
                        }
                        else {
                            modifyNum = 1;
                        }
                        // 获取增，删，改和不变得到的最小值
                        var min = Math.min(prevDistance + 1, topDistance + 1, temp + modifyNum);
                        // 保存左上角的数据，计算最小值时需要用到
                        temp = topDistance;
                        space[col] = min;
                    }
                    // 如果匹配到了结果
                    if (matchIndex !== -1) {
                        if (row > 0 &&
                            matchIndex > 0 &&
                            inputValue[row - 1] === comparedValue[matchIndex - 1]) {
                            if (continuous === 0) {
                                continuous = 2;
                            }
                            else {
                                continuous++;
                            }
                        }
                        else if (continuous === 0) {
                            continuous++;
                        }
                        else {
                            // 设置最长的连续字符
                            this.setContinuous(continuous);
                            continuous = 1;
                        }
                        matchPositionList.push(matchIndex);
                    }
                    else {
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
        };
        return DistanceCalculator;
    }());
    exports.DistanceCalculator = DistanceCalculator;
    var compareAdaptor = function (options) {
        return function (inputValue, comparedValue) {
            return new DistanceCalculator(options).get(inputValue, comparedValue);
        };
    };
    exports.compareAdaptor = compareAdaptor;
});
//# sourceMappingURL=levenshtein-distance.js.map