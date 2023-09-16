"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBody = void 0;
var UniqueIdentity_1 = require("./UniqueIdentity");
var MessageBody = /** @class */ (function () {
    function MessageBody() {
        this.jsonrpc = "2.0";
    }
    MessageBody.checkProtocol = function (data) {
        if (Array.isArray(data)) {
            return data.every(function (item) {
                if (Array.isArray(item)) {
                    return false;
                }
                return MessageBody.checkProtocol(item);
            });
        }
        if (typeof data === "object" && data !== null) {
            return data.jsonrpc === "2.0";
        }
        return false;
    };
    MessageBody.prototype.notify = function (method, params) {
        var jsonrpc = this.jsonrpc;
        return {
            jsonrpc: jsonrpc,
            method: method,
            params: params,
        };
    };
    MessageBody.prototype.request = function (method, params) {
        var jsonrpc = this.jsonrpc;
        var uid = new UniqueIdentity_1.UniqueIdentity();
        return {
            jsonrpc: jsonrpc,
            id: uid.generateRandom(),
            method: method,
            params: params,
        };
    };
    MessageBody.prototype.response = function (id, result) {
        var jsonrpc = this.jsonrpc;
        return {
            jsonrpc: jsonrpc,
            id: id,
            result: result,
        };
    };
    MessageBody.prototype.error = function (id, code, message, data) {
        var jsonrpc = this.jsonrpc;
        return {
            jsonrpc: jsonrpc,
            id: id,
            error: {
                code: code,
                message: message,
                data: data,
            },
        };
    };
    MessageBody.type = "json-rpc";
    return MessageBody;
}());
exports.MessageBody = MessageBody;
//# sourceMappingURL=MessageBody.js.map