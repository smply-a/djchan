import { ButtonInteraction, type InteractionButtonComponentData } from "discord.js";
import { Logger } from "./Logger.js";

// ? buttons that are independant from the message they belong to
// only for logic buttons (with callback), link buttons directly over builder
export abstract class StaticButton {
    #logger?: Logger
        public get logger(): Logger {
            return this.#logger ??= new Logger({
                type: "button",
                origin: this.data.customId
            })
        }

    constructor(public readonly data: InteractionButtonComponentData) {}

    protected abstract execute(interaction: ButtonInteraction): Promise<void>;

    public async run (interaction: ButtonInteraction) {
        await this.execute(interaction)
    }
}