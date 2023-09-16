var MessageQueue = /** @class */ (function () {
    function MessageQueue() {
        this.queue = [];
    }
    MessageQueue.prototype.push = function (body) {
        this.queue.push(body);
    };
    MessageQueue.prototype.pop = function () {
        return this.queue.shift();
    };
    return MessageQueue;
}());
export { MessageQueue };
//# sourceMappingURL=MessageQueue.js.map