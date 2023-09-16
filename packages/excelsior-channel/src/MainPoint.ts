import { CorePoint } from "./CorePoint";
import { POINT_SIGNALS } from "./constants/signals";

export class MainPoint extends CorePoint {
	constructor(target: HTMLIFrameElement | Window) {
		super();

		const channel: MessageChannel = new MessageChannel();

		this.connect(channel.port1);

		if (target instanceof HTMLIFrameElement) {
			target.addEventListener("load", () =>
				this.start(target.contentWindow, channel.port2),
			);
		} else {
			target.addEventListener("load", () => this.start(target, channel.port2));
		}
	}

	private start(target: Window, port: MessagePort): void {
		if (target) {
			// 发起连接请求
			target.postMessage(POINT_SIGNALS.CONNECT, "*", [port]);
			this.journal.debug("发起连接请求...");
		}
	}

	protected handleSignalMessage(event: MessageEvent<any>): void {
		if (event.data === POINT_SIGNALS.OK) {
			this.journal.debug("握手完成！");
			this.ready();
		}
	}
}
