import { UniqueIdentity } from "./UniqueIdentity";

export interface MessageNotification<T> {
	jsonrpc: string;
	method: string;
	params: T;
}

export interface MessageRequest<T> extends MessageNotification<T> {
	id: string;
}

export interface MessageResponse<T> {
	jsonrpc: string;
	id: string;
	result?: T;
	error?: MessageResponseError;
}

export interface MessageResponseError {
	code: number;
	message: string;
	data?: any;
}

export class MessageBody<T> {
	private jsonrpc = "2.0";

	static type = "json-rpc";

	static checkProtocol(data: any): boolean {
		if (Array.isArray(data)) {
			return data.every((item: any) => {
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
	}

	notify(method: string, params: T): MessageNotification<T> {
		const { jsonrpc } = this;

		return {
			jsonrpc,
			method,
			params,
		};
	}

	request(method: string, params: T): MessageRequest<T> {
		const { jsonrpc } = this;
		const uid = new UniqueIdentity();

		return {
			jsonrpc,
			id: uid.generateRandom(),
			method,
			params,
		};
	}

	response(id: string, result: T): MessageResponse<T> {
		const { jsonrpc } = this;

		return {
			jsonrpc,
			id,
			result,
		};
	}

	error(
		id: string,
		code: number,
		message: string,
		data?: any,
	): MessageResponse<null> {
		const { jsonrpc } = this;

		return {
			jsonrpc,
			id,
			error: {
				code,
				message,
				data,
			},
		};
	}
}
