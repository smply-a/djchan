import {} from "discord.js";
import { Logger } from "./Logger.js";
export class Command {
    data;
    constructor(data) {
        this.data = data;
    }
    // to make command clickable in help
    id;
    // filter 
    async run(interaction) {
        await this.execute(interaction);
    }
    // lazy init
    #logger;
    get logger() {
        return this.#logger ??= new Logger({
            type: "command",
            origin: this.data.name
        });
    }
    // utils
    async deleteReply(seconds, interaction) {
        setTimeout(() => {
            void interaction.deleteReply().catch(() => { });
        }, seconds * 1000);
    }
}
