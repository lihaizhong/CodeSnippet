export class ChannelError extends Error {
	constructor(message?: string) {
		super(`【ExcelsiorChannel】${message}`);
	}
}
