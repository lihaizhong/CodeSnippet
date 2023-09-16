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
import { CorePoint } from "./CorePoint";
import { POINT_SIGNALS } from "./constants/signals";
var MainPoint = /** @class */ (function (_super) {
    __extends(MainPoint, _super);
    function MainPoint(target) {
        var _this = _super.call(this) || this;
        var channel = new MessageChannel();
        _this.connect(channel.port1);
        if (target instanceof HTMLIFrameElement) {
            target.addEventListener("load", function () {
                return _this.start(target.contentWindow, channel.port2);
            });
        }
        else {
            target.addEventListener("load", function () { return _this.start(target, channel.port2); });
        }
        return _this;
    }
    MainPoint.prototype.start = function (target, port) {
        if (target) {
            // 发起连接请求
            target.postMessage(POINT_SIGNALS.CONNECT, "*", [port]);
            this.journal.debug("发起连接请求...");
        }
    };
    MainPoint.prototype.handleSignalMessage = function (event) {
        if (event.data === POINT_SIGNALS.OK) {
            this.journal.debug("握手完成！");
            this.ready();
        }
    };
    return MainPoint;
}(CorePoint));
export { MainPoint };
//# sourceMappingURL=MainPoint.js.map