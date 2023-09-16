export type IAsyncReadyOption = {
	only: boolean;
};

export default class AsyncReady {
	static ReadyStatus = {
		initialize: "INITIALIZE",
		pending: "PENDING",
		completed: "COMPLETED",
	};

	static callReadyFunc(callback: any, ...args: any[]) {
		if (typeof callback === "function") {
			return callback(...args);
		}

		return null;
	}

	private status: string = AsyncReady.ReadyStatus.initialize;

	private callbacks: any[] = [];

	private params: any;

	private options: IAsyncReadyOption;

	constructor(option: IAsyncReadyOption) {
		this.options = Object.assign({ only: false }, option);
	}

	updateParams(params: any): void {
		this.params = params;
	}

	ready(callback: any): void {
		if (this.status === AsyncReady.ReadyStatus.completed) {
			AsyncReady.callReadyFunc(callback, this.params);
		} else {
			if (this.options.only) {
				this.callbacks = [callback];
			} else {
				this.callbacks.push(callback);
			}
		}
	}

	wait(): void {
		this.status = AsyncReady.ReadyStatus.pending;
	}

	reset(): void {
		this.status = AsyncReady.ReadyStatus.initialize;
	}

	complete(): void {
		this.status = AsyncReady.ReadyStatus.completed;
		for (const callback of this.callbacks) {
			AsyncReady.callReadyFunc(callback, this.params);
		}
		this.callbacks = [];
	}
}
