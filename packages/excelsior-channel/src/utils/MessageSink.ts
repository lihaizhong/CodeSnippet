export type MessageSinkCallback = (data: any) => void | Promise<void>;

export interface MessageSinkHandler {
	notify: MessageSinkCallback[];
	request: MessageSinkCallback[];
	response: MessageSinkCallback[];
	error: MessageSinkCallback[];
}

export class MessageSink {
	private payload: any;

	private handlers: MessageSinkHandler = {
		notify: [],
		request: [],
		response: [],
		error: [],
	};

	constructor(payload: any) {
		this.payload = payload;
	}

	bootstrap(): void {
		// 根据数据规范判断响应类型
		if ("method" in this.payload && "params" in this.payload) {
			if ("id" in this.payload) {
				for (const request of this.handlers.request) {
					request(this.payload);
				}
			} else {
				for (const notify of this.handlers.notify) {
					notify(this.payload);
				}
			}
		} else if ("id" in this.payload && "result" in this.payload) {
			for (const response of this.handlers.response) {
				response(this.payload);
			}
		} else {
			for (const error of this.handlers.error) {
				error(this.payload);
			}
		}
	}

	clean(): void {
		const keys = Object.keys(this.handlers);

		for (const key of keys) {
			this.handlers[key] = [];
		}
	}

	onNotify(fn: MessageSinkCallback): void {
		this.handlers.notify.push(fn);
	}

	onRequest(fn: MessageSinkCallback): void {
		this.handlers.request.push(fn);
	}

	onResponse(fn: MessageSinkCallback): void {
		this.handlers.response.push(fn);
	}

	onError(fn: MessageSinkCallback): void {
		this.handlers.error.push(fn);
	}
}
