type Type = "command" | "event" | "internal"
interface Options {
    type: Type
    origin: string
}

export class Logger {
    constructor(private options: Options) {}

    log(...args: unknown[]) {
        console.log(`[${this.options.type} : ${this.options.origin}] > ${args.join("\n> ")}`)
    }
}