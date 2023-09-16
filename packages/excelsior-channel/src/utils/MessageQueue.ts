export interface MessageReadyBody {
	type: number;
	body: any;
}

export class MessageQueue {
	private queue: MessageReadyBody[] = [];

	push(body: MessageReadyBody): void {
		this.queue.push(body);
	}

	pop(): MessageReadyBody | undefined {
		return this.queue.shift();
	}
}
