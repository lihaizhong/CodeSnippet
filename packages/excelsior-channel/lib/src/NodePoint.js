"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodePoint = void 0;
var CorePoint_1 = require("./CorePoint");
var signals_1 = require("./constants/signals");
var NodePoint = /** @class */ (function (_super) {
    __extends(NodePoint, _super);
    function NodePoint() {
        var _this = _super.call(this) || this;
        window.addEventListener("message", function (event) {
            // 请求建立连接
            if (event.data === signals_1.POINT_SIGNALS.CONNECT) {
                var port = event.ports[0];
                _this.connect(port);
                _this.journal.debug("连接成功！");
                port.postMessage(signals_1.POINT_SIGNALS.OK);
                _this.ready();
            }
        });
        return _this;
    }
    return NodePoint;
}(CorePoint_1.CorePoint));
exports.NodePoint = NodePoint;
//# sourceMappingURL=NodePoint.js.map