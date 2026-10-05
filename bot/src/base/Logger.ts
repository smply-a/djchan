type Type = "command" | "event" | "internal" | "button"
interface Options {
    type: Type
    origin: string
}

export class Logger {
    constructor(private options: Options) {}

    log(...args: unknown[]) {
        const time = this.timestamp();
        console.log(`[${time}] [${this.options.type} : ${this.options.origin}] > ${args.join("\n> ")}`)
    }

    error(...args: unknown[]) {
        const time = this.timestamp();
        console.log(`[${time}] [Error] [${this.options.type} : ${this.options.origin}] > `, ...args)
    }

    private timestamp(): string {
        return new Date().toLocaleString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false // Force 24-hour time
        });
    }
}