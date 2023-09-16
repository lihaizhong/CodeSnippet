import { MessageStatus, MessageTypeEnum } from "./constants/message";
import { POINT_SIGNAL_REG } from "./constants/signals";
import { ChannelError } from "./utils/ChannelError";
import { Journal } from "./utils/Journal";
import {
	MessageBody,
	type MessageNotification,
	type MessageRequest,
	type MessageResponse,
} from "./utils/MessageBody";
import { MessageQueue, type MessageReadyBody } from "./utils/MessageQueue";
import { MessageSink } from "./utils/MessageSink";

export type PointController = (...params: any[]) => any;

export class CorePoint {
	protected port: MessagePort | null = null;

	protected body: MessageBody<any> = new MessageBody();

	protected queue: MessageQueue = new MessageQueue();

	protected controllers: Record<string, PointController> = {};

	protected subscriptions: Record<
		string,
		{ success: (value: any) => void; error: (error: any) => void }
	> = {};

	protected isReady = false;

	protected journal: Journal = new Journal();

	/**
	 * 包装端口封装
	 * @param endpoint
	 * @returns
	 */
	static wrap<T extends object>(endpoint: CorePoint): T {
		return new Proxy(endpoint, {
			get(target: CorePoint, p: string | symbol): any {
				return (...params: any[]) =>
					Reflect.get(target, "invoke").call(target, p, ...params);
			},

			set(target: CorePoint, p: string | symbol, newValue: any): boolean {
				if (typeof newValue !== "function") {
					throw new ChannelError(
						`property ${p.toString()} must be a function!`,
					);
				}

				Reflect.get(target, "declare").call(target, p, newValue);
				return true;
			},
		}) as unknown as T;
	}

	/**
	 * 检查唯一标识是否合法
	 * @param id
	 * @returns
	 */
	protected checkIdentification(id: string): boolean {
		return typeof id === "string" && id !== "";
	}

	/**
	 * 获取协议类型
	 * @param data
	 * @returns
	 */
	protected getProtocolType(data: any): string {
		if (MessageBody.checkProtocol(data)) {
			return MessageBody.type;
		}

		if (typeof data === "string" && POINT_SIGNAL_REG.test(data)) {
			return "signal";
		}

		return "";
	}

	/**
	 * 处理json-rpc协议消息
	 * @param event
	 */
	protected handleJsonRPCMessage(event: MessageEvent): void {
		const sink = new MessageSink(event.data);

		// 处理通知消息
		sink.onNotify(async (data: MessageNotification<any>) => {
			try {
				const { method, params } = data;

				// 检查调用的方法是否存在
				if (!(typeof this.controllers[method] === "function")) {
					throw new ChannelError(`method<${method}> does not declare!`);
				}

				const fn = this.controllers[method];

				// 检查方法的参数个数是否一致
				if (fn.length !== params.length) {
					throw new ChannelError(`method<${method}> invalid method parameters`);
				}

				await fn(...params);
				this.journal.group("notify success").success("---- 请求体 ----", data);
			} catch (ex) {
				// 捕获未知的异常情况
				this.journal
					.group("notify fail")
					.error("---- 请求体 ----", data, "---- 内部错误信息 ----", ex);
			}
		});

		// 处理请求消息
		sink.onRequest(async (data: MessageRequest<any>) => {
			try {
				const { method, params } = data;

				// 检查id是否合法
				if (!this.checkIdentification(data.id)) {
					throw new ChannelError("NotWellFormed");
				}

				// 检查调用的方法是否存在
				if (!(typeof this.controllers[method] === "function")) {
					throw new ChannelError("NotFound");
				}

				const fn = this.controllers[method];

				// 检查方法的参数个数是否一致
				if (fn.length > params.length) {
					throw new ChannelError("InvalidMethodParameters");
				}

				const result = await fn(...params);

				this.journal.group("request success").success("---- 请求体 ----", data);
				// 获取执行结果，并发送成功消息
				this.postSuccessMessage(data.id, result || null);
			} catch (ex) {
				if (Object.keys(MessageStatus).includes(ex.message)) {
					this.journal.group("request fail").error("---- 请求体 ----", data);
					// 捕获未知的异常情况并发送错误消息
					this.postErrorMessage(data.id, ex.message);
				} else {
					this.journal
						.group("request fail")
						.error("---- 请求体 ----", data, "---- 内部错误信息 ----", ex);
					this.postErrorMessage(data.id, "InternalRPCError");
				}
			}
		});

		// 处理响应消息
		sink.onResponse(async (data: MessageResponse<any>) => {
			this.journal.group("response success").success("---- 响应体 ----", data);

			if (this.checkIdentification(data.id)) {
				const { success } = this.subscriptions[data.id] || {};

				if (typeof success === "function") {
					success(data.result);
				}
			}
		});

		// 处理错误消息
		sink.onError(async (data: MessageResponse<any>) => {
			this.journal.group("error success").error("---- 错误信息 ----", data);

			if (this.checkIdentification(data.id)) {
				const { error } = this.subscriptions[data.id] || {};

				if (typeof error === "function") {
					error(data.error);
				}
			}
		});

		sink.bootstrap();
	}

	/**
	 * 处理信号消息
	 * @param event
	 */
	protected handleSignalMessage(event: MessageEvent): void {}

	/**
	 * 建立通信连接
	 * @param port
	 */
	protected connect(port: MessagePort) {
		// 端口绑定
		this.port = port;
		// 消息监听
		port.onmessage = (event: MessageEvent) => {
			// 根据协议类型，处理通信消息
			switch (this.getProtocolType(event.data)) {
				case MessageBody.type:
					this.handleJsonRPCMessage(event);
					break;
				case "signal":
					this.handleSignalMessage(event);
					break;
				default:
					this.postErrorMessage("unknown message type", "InvalidRPC");
			}
		};
	}

	/**
	 * 连接成功后，统一处理等待的消息
	 */
	protected ready() {
		let data: MessageReadyBody | undefined;

		this.isReady = true;
		// 循环调用等待队列，直到所有消息发送完成
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while ((data = this.queue.pop())) {
			this.port?.postMessage(data.body);
		}
	}

	/**
	 * 标准的消息处理
	 * @param type
	 * @param data
	 */
	private postNormalizeMessage(type: number, data: any): void {
		// 检查连接是否建立，若未建立，则将消息推入等待队列。
		if (this.isReady) {
			this.port?.postMessage(data);
		} else {
			this.queue.push({ type, body: data });
		}
	}

	/**
	 * 处理标准的成功消息
	 * @param id
	 * @param result
	 */
	protected postSuccessMessage(id: string, result: any): void {
		const payload = this.body.response(id, result);

		this.postNormalizeMessage(MessageTypeEnum.RESPONSE, payload);
	}

	/**
	 * 处理标准的失败消息
	 * @param id
	 * @param statusText
	 */
	protected postErrorMessage(id: string, statusText: string): void {
		const { code, type, message } = MessageStatus[statusText];
		const payload = this.body.error(id, code, message, type);

		this.postNormalizeMessage(MessageTypeEnum.ERROR, payload);
	}

	/**
	 * 声明远程调用的函数
	 * @param method
	 * @param fn
	 */
	declare(method: string, fn: PointController): void {
		this.controllers[method] = fn;
	}

	/**
	 * 发送通知消息（只关心消息发送）
	 * @param method
	 * @param params
	 */
	notify(method: string, ...params: any[]): void {
		const payload = this.body.notify(method, params);

		this.postNormalizeMessage(MessageTypeEnum.NOTIFY, payload);
	}

	/**
	 * 调用远程函数（消息发送完成后，可以通过订阅的方式获取返回值）
	 * @param method
	 * @param params
	 * @returns
	 */
	invoke(method: string, ...params: any[]): Promise<any> {
		const payload = this.body.request(method, params);

		this.postNormalizeMessage(MessageTypeEnum.REQUEST, payload);

		return new Promise((resolve, reject) => {
			this.subscriptions[payload.id] = { success: resolve, error: reject };
		});
	}
}
