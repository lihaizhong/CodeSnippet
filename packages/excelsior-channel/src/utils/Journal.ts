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

export class Journal {
	static levels: string[] = ["log", "info", "warn", "error"];

	private inst: JournalConsole;

	private label: string | null = null;

	private level = "info";

	constructor(inst: JournalConsole = console) {
		this.inst = inst;
	}

	static style(background: string, color = "#FFFFFF") {
		return `padding: 2px 4px; background: ${background}; color: ${color}; border-radius: 4px;`;
	}

	protected printf(label: string, messages: any[], cb: (message: any) => void) {
		if (messages.length < 2) {
			messages.forEach(cb);
		} else {
			this.inst.group(this.label || label);
			messages.forEach(cb);
			this.inst.groupEnd();
			this.label = null;
		}
	}

	protected compareLevel(level: string): boolean {
		return Journal.levels.indexOf(this.level) >= Journal.levels.indexOf(level);
	}

	setLevel(level: "error" | "warn" | "log" | "info"): void {
		this.level = level;
	}

	group(label: string): JournalGroupExpose {
		this.label = label.toLocaleUpperCase();

		return {
			success: this.success.bind(this),
			info: this.info.bind(this),
			debug: this.debug.bind(this),
			warn: this.warn.bind(this),
			error: this.error.bind(this),
		};
	}

	log(...args: any[]): void {
		this.compareLevel("log") && this.inst.log(...args);
	}

	success(...args: any[]): void {
		this.compareLevel("info") &&
			this.printf("SUCCESS", args, (message: any) => {
				this.inst.log("%csuccess", Journal.style("#68B984"), message);
			});
	}

	info(...args: any[]): void {
		this.compareLevel("info") &&
			this.printf("INFO", args, (message: any) => {
				this.inst.info("%cinfo", Journal.style("#B2A4FF"), message);
			});
	}

	debug(...args: any[]): void {
		this.compareLevel("info") &&
			this.printf("DEBUG", args, (message: any) => {
				this.inst.log("%cdebug", Journal.style("#3DB2FF"), message);
			});
	}

	warn(...args: any[]): void {
		this.compareLevel("warn") &&
			this.printf("WARNING", args, (message: any) => {
				this.inst.warn("%cwarning", Journal.style("#FFB830"), message);
			});
	}

	error(...args: any[]): void {
		this.compareLevel("error") &&
			this.printf("ERROR", args, (message: any) => {
				this.inst.error("%cerror", Journal.style("#FF2442"), message);
			});
	}
}
