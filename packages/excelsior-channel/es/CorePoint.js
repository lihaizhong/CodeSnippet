var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { MessageStatus, MessageTypeEnum } from "./constants/message";
import { POINT_SIGNAL_REG } from "./constants/signals";
import { ChannelError } from "./utils/ChannelError";
import { Journal } from "./utils/Journal";
import { MessageBody, } from "./utils/MessageBody";
import { MessageQueue } from "./utils/MessageQueue";
import { MessageSink } from "./utils/MessageSink";
var CorePoint = /** @class */ (function () {
    function CorePoint() {
        this.port = null;
        this.body = new MessageBody();
        this.queue = new MessageQueue();
        this.controllers = {};
        this.subscriptions = {};
        this.isReady = false;
        this.journal = new Journal();
    }
    /**
     * 包装端口封装
     * @param endpoint
     * @returns
     */
    CorePoint.wrap = function (endpoint) {
        return new Proxy(endpoint, {
            get: function (target, p) {
                return function () {
                    var _a;
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    return (_a = Reflect.get(target, "invoke")).call.apply(_a, __spreadArray([target, p], params, false));
                };
            },
            set: function (target, p, newValue) {
                if (typeof newValue !== "function") {
                    throw new ChannelError("property ".concat(p.toString(), " must be a function!"));
                }
                Reflect.get(target, "declare").call(target, p, newValue);
                return true;
            },
        });
    };
    /**
     * 检查唯一标识是否合法
     * @param id
     * @returns
     */
    CorePoint.prototype.checkIdentification = function (id) {
        return typeof id === "string" && id !== "";
    };
    /**
     * 获取协议类型
     * @param data
     * @returns
     */
    CorePoint.prototype.getProtocolType = function (data) {
        if (MessageBody.checkProtocol(data)) {
            return MessageBody.type;
        }
        if (typeof data === "string" && POINT_SIGNAL_REG.test(data)) {
            return "signal";
        }
        return "";
    };
    /**
     * 处理json-rpc协议消息
     * @param event
     */
    CorePoint.prototype.handleJsonRPCMessage = function (event) {
        var _this = this;
        var sink = new MessageSink(event.data);
        // 处理通知消息
        sink.onNotify(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var method, params, fn, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        method = data.method, params = data.params;
                        // 检查调用的方法是否存在
                        if (!(typeof this.controllers[method] === "function")) {
                            throw new ChannelError("method<".concat(method, "> does not declare!"));
                        }
                        fn = this.controllers[method];
                        // 检查方法的参数个数是否一致
                        if (fn.length !== params.length) {
                            throw new ChannelError("method<".concat(method, "> invalid method parameters"));
                        }
                        return [4 /*yield*/, fn.apply(void 0, params)];
                    case 1:
                        _a.sent();
                        this.journal.group("notify success").success("---- 请求体 ----", data);
                        return [3 /*break*/, 3];
                    case 2:
                        ex_1 = _a.sent();
                        // 捕获未知的异常情况
                        this.journal
                            .group("notify fail")
                            .error("---- 请求体 ----", data, "---- 内部错误信息 ----", ex_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // 处理请求消息
        sink.onRequest(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var method, params, fn, result, ex_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        method = data.method, params = data.params;
                        // 检查id是否合法
                        if (!this.checkIdentification(data.id)) {
                            throw new ChannelError("NotWellFormed");
                        }
                        // 检查调用的方法是否存在
                        if (!(typeof this.controllers[method] === "function")) {
                            throw new ChannelError("NotFound");
                        }
                        fn = this.controllers[method];
                        // 检查方法的参数个数是否一致
                        if (fn.length > params.length) {
                            throw new ChannelError("InvalidMethodParameters");
                        }
                        return [4 /*yield*/, fn.apply(void 0, params)];
                    case 1:
                        result = _a.sent();
                        this.journal.group("request success").success("---- 请求体 ----", data);
                        // 获取执行结果，并发送成功消息
                        this.postSuccessMessage(data.id, result || null);
                        return [3 /*break*/, 3];
                    case 2:
                        ex_2 = _a.sent();
                        if (Object.keys(MessageStatus).includes(ex_2.message)) {
                            this.journal.group("request fail").error("---- 请求体 ----", data);
                            // 捕获未知的异常情况并发送错误消息
                            this.postErrorMessage(data.id, ex_2.message);
                        }
                        else {
                            this.journal
                                .group("request fail")
                                .error("---- 请求体 ----", data, "---- 内部错误信息 ----", ex_2);
                            this.postErrorMessage(data.id, "InternalRPCError");
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // 处理响应消息
        sink.onResponse(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                this.journal.group("response success").success("---- 响应体 ----", data);
                if (this.checkIdentification(data.id)) {
                    success = (this.subscriptions[data.id] || {}).success;
                    if (typeof success === "function") {
                        success(data.result);
                    }
                }
                return [2 /*return*/];
            });
        }); });
        // 处理错误消息
        sink.onError(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                this.journal.group("error success").error("---- 错误信息 ----", data);
                if (this.checkIdentification(data.id)) {
                    error = (this.subscriptions[data.id] || {}).error;
                    if (typeof error === "function") {
                        error(data.error);
                    }
                }
                return [2 /*return*/];
            });
        }); });
        sink.bootstrap();
    };
    /**
     * 处理信号消息
     * @param event
     */
    CorePoint.prototype.handleSignalMessage = function (event) { };
    /**
     * 建立通信连接
     * @param port
     */
    CorePoint.prototype.connect = function (port) {
        var _this = this;
        // 端口绑定
        this.port = port;
        // 消息监听
        port.onmessage = function (event) {
            // 根据协议类型，处理通信消息
            switch (_this.getProtocolType(event.data)) {
                case MessageBody.type:
                    _this.handleJsonRPCMessage(event);
                    break;
                case "signal":
                    _this.handleSignalMessage(event);
                    break;
                default:
                    _this.postErrorMessage("unknown message type", "InvalidRPC");
            }
        };
    };
    /**
     * 连接成功后，统一处理等待的消息
     */
    CorePoint.prototype.ready = function () {
        var _a;
        var data;
        this.isReady = true;
        // 循环调用等待队列，直到所有消息发送完成
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        while ((data = this.queue.pop())) {
            (_a = this.port) === null || _a === void 0 ? void 0 : _a.postMessage(data.body);
        }
    };
    /**
     * 标准的消息处理
     * @param type
     * @param data
     */
    CorePoint.prototype.postNormalizeMessage = function (type, data) {
        var _a;
        // 检查连接是否建立，若未建立，则将消息推入等待队列。
        if (this.isReady) {
            (_a = this.port) === null || _a === void 0 ? void 0 : _a.postMessage(data);
        }
        else {
            this.queue.push({ type: type, body: data });
        }
    };
    /**
     * 处理标准的成功消息
     * @param id
     * @param result
     */
    CorePoint.prototype.postSuccessMessage = function (id, result) {
        var payload = this.body.response(id, result);
        this.postNormalizeMessage(MessageTypeEnum.RESPONSE, payload);
    };
    /**
     * 处理标准的失败消息
     * @param id
     * @param statusText
     */
    CorePoint.prototype.postErrorMessage = function (id, statusText) {
        var _a = MessageStatus[statusText], code = _a.code, type = _a.type, message = _a.message;
        var payload = this.body.error(id, code, message, type);
        this.postNormalizeMessage(MessageTypeEnum.ERROR, payload);
    };
    /**
     * 声明远程调用的函数
     * @param method
     * @param fn
     */
    CorePoint.prototype.declare = function (method, fn) {
        this.controllers[method] = fn;
    };
    /**
     * 发送通知消息（只关心消息发送）
     * @param method
     * @param params
     */
    CorePoint.prototype.notify = function (method) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var payload = this.body.notify(method, params);
        this.postNormalizeMessage(MessageTypeEnum.NOTIFY, payload);
    };
    /**
     * 调用远程函数（消息发送完成后，可以通过订阅的方式获取返回值）
     * @param method
     * @param params
     * @returns
     */
    CorePoint.prototype.invoke = function (method) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var payload = this.body.request(method, params);
        this.postNormalizeMessage(MessageTypeEnum.REQUEST, payload);
        return new Promise(function (resolve, reject) {
            _this.subscriptions[payload.id] = { success: resolve, error: reject };
        });
    };
    return CorePoint;
}());
export { CorePoint };
//# sourceMappingURL=CorePoint.js.map