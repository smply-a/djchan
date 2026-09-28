import { Logger } from "./Logger.js";
export class Event {
    name;
    once;
    constructor(name, once = false) {
        this.name = name;
        this.once = once;
    }
    // lazy init
    #logger;
    get logger() {
        return this.#logger ??= new Logger({
            type: "event",
            origin: this.name
        });
    }
    // Error catching
    async run(...args) {
        try {
            await this.execute(...args);
        }
        catch (error) {
            this.logger.log(error);
        }
    }
    async deleteReply(seconds, interaction) {
        setTimeout(() => {
            void interaction.deleteReply().catch(() => { });
        }, seconds * 1000);
    }
}
