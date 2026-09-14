import { ButtonInteraction, type InteractionButtonComponentData } from "discord.js";
import { Logger } from "./Logger.js";

// only logic buttons, link buttons directly over builder
export abstract class Button<T = null> {
    #logger?: Logger
        public get logger(): Logger {
            return this.#logger ??= new Logger({
                type: "button",
                origin: this.data.customId
            })
        }

    constructor(public readonly data: InteractionButtonComponentData) {}

    protected abstract execute(interaction: ButtonInteraction, args: T): Promise<void>;

    public async run (interaction: ButtonInteraction, args: T) {
        await this.execute(interaction, args)
    }
}