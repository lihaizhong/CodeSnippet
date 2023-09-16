import { CorePoint } from "./CorePoint";
export declare class MainPoint extends CorePoint {
    constructor(target: HTMLIFrameElement | Window);
    private start;
    protected handleSignalMessage(event: MessageEvent<any>): void;
}
