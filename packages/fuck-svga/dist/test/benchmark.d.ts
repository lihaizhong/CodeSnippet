declare const _default: {
    count: number;
    label(label: string): void;
    time(label: string, callback: () => void, beforeCallback?: ((count: number) => void) | null, afterCallback?: ((count: number) => void) | null): void;
    clearTime(label: string): void;
    lockTime(label: string): void;
    unlockTime(label: string): void;
    line(size?: number): void;
};
export default _default;
