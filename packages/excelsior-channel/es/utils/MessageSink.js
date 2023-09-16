var MessageSink = /** @class */ (function () {
    function MessageSink(payload) {
        this.handlers = {
            notify: [],
            request: [],
            response: [],
            error: [],
        };
        this.payload = payload;
    }
    MessageSink.prototype.bootstrap = function () {
        // 根据数据规范判断响应类型
        if ("method" in this.payload && "params" in this.payload) {
            if ("id" in this.payload) {
                for (var _i = 0, _a = this.handlers.request; _i < _a.length; _i++) {
                    var request = _a[_i];
                    request(this.payload);
                }
            }
            else {
                for (var _b = 0, _c = this.handlers.notify; _b < _c.length; _b++) {
                    var notify = _c[_b];
                    notify(this.payload);
                }
            }
        }
        else if ("id" in this.payload && "result" in this.payload) {
            for (var _d = 0, _e = this.handlers.response; _d < _e.length; _d++) {
                var response = _e[_d];
                response(this.payload);
            }
        }
        else {
            for (var _f = 0, _g = this.handlers.error; _f < _g.length; _f++) {
                var error = _g[_f];
                error(this.payload);
            }
        }
    };
    MessageSink.prototype.clean = function () {
        var keys = Object.keys(this.handlers);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            this.handlers[key] = [];
        }
    };
    MessageSink.prototype.onNotify = function (fn) {
        this.handlers.notify.push(fn);
    };
    MessageSink.prototype.onRequest = function (fn) {
        this.handlers.request.push(fn);
    };
    MessageSink.prototype.onResponse = function (fn) {
        this.handlers.response.push(fn);
    };
    MessageSink.prototype.onError = function (fn) {
        this.handlers.error.push(fn);
    };
    return MessageSink;
}());
export { MessageSink };
//# sourceMappingURL=MessageSink.js.map