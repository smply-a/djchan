export class Logger {
    options;
    constructor(options) {
        this.options = options;
    }
    log(...args) {
        console.log(`[${this.options.type} : ${this.options.origin}] > ${args.join("\n> ")}`);
    }
    error(...args) {
        console.log(`[Error] [${this.options.type} : ${this.options.origin}] > `, ...args);
    }
}
