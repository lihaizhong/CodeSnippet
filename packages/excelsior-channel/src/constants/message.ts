/**
 * -32768至-32000为保留的预定义错误代码。在该范围内的错误代码不能被明确定义，保留下列以供将来使用。
 * -32000至-32099为预留的自定义服务器错误。
 */
export const MessageStatus: Record<string, any> = {
	NotWellFormed: {
		code: -32700,
		type: "parse error",
		message: "parse error. not well formed.",
	},
	InvalidRPC: {
		code: -32600,
		type: "server error",
		message: "server error. invalid json-rpc. not conforming to spec.",
	},
	NotFound: {
		code: -32601,
		type: "server error",
		message: "server error. requested method not found.",
	},
	InvalidMethodParameters: {
		code: -32602,
		type: "server error",
		message: "server error. invalid method parameters.",
	},
	InternalRPCError: {
		code: -32603,
		type: "server error",
		message: "server error. internal json-rpc error.",
	},
};

export const MessageTypeEnum = {
	REQUEST: 1,
	NOTIFY: 2,
	RESPONSE: 3,
	ERROR: 4,
};
