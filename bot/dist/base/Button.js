import { ButtonInteraction } from "discord.js";
import { Logger } from "./Logger.js";
// ? buttons that are independant from the message they belong to
// only for logic buttons (with callback), link buttons directly over builder
export class StaticButton {
    data;
    #logger;
    get logger() {
        return this.#logger ??= new Logger({
            type: "button",
            origin: this.data.customId
        });
    }
    constructor(data) {
        this.data = data;
    }
    async run(interaction) {
        await this.execute(interaction);
    }
}
