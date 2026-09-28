type Type = "command" | "event" | "internal" | "button";
interface Options {
    type: Type;
    origin: string;
}
export declare class Logger {
    private options;
    constructor(options: Options);
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
}
export {};
