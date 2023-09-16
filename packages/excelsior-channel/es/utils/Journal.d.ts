export type JournalConsoleFn = (...args: any[]) => void;
export interface JournalConsole {
    group(label: string): void;
    groupEnd(): void;
    log: JournalConsoleFn;
    info: JournalConsoleFn;
    debug: JournalConsoleFn;
    warn: JournalConsoleFn;
    error: JournalConsoleFn;
}
export interface JournalGroupExpose {
    success: JournalConsoleFn;
    info: JournalConsoleFn;
    debug: JournalConsoleFn;
    warn: JournalConsoleFn;
    error: JournalConsoleFn;
}
export declare class Journal {
    static levels: string[];
    private inst;
    private label;
    private level;
    constructor(inst?: JournalConsole);
    static style(background: string, color?: string): string;
    protected printf(label: string, messages: any[], cb: (message: any) => void): void;
    protected compareLevel(level: string): boolean;
    setLevel(level: "error" | "warn" | "log" | "info"): void;
    group(label: string): JournalGroupExpose;
    log(...args: any[]): void;
    success(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
