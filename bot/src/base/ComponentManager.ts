import type { ButtonInteraction } from "discord.js";
import type { Button } from "./Components.js";
import { Logger } from "./Logger.js";
import { ButtonExpired } from "./PublicErrors.js";

// todo maybe make custom id like: guildid:buttonaction:uuid, so that you can remove buttons form the "outside"

export class ComponentManager {
    private buttons = new Map<string, {button: Button<unknown>, context: unknown, timeout: NodeJS.Timeout}>()
    private timeout: number

    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: "component manager"
        })
    }

    constructor(options: {
        timeout: number
    }) {
        this.timeout = options.timeout
    }

    //todo make for any compoennt 
    register<T>(button: Button<T>, context: T) {
        //prevent memory leak
        const timeout = setTimeout(() => {
            this.buttons.delete(button.customId)
        }, this.timeout * 1000)

        timeout.unref()

        this.buttons.set(button.customId, {button, context, timeout})
        this.logger.log(`added component to handle: ${button.customId}`)
    }

    delete(button: Button<unknown>) {
        const entry = this.buttons.get(button.customId);
        if (entry) {
            clearTimeout(entry.timeout);
            this.buttons.delete(button.customId);
        }
        this.logger.log(`removed component to handle: ${button.customId}`)
    }

    async handleButton(interaction: ButtonInteraction) {
        const id = interaction.customId

        const entry = this.buttons.get(id)
        if (!entry) throw new ButtonExpired()

        await entry.button.run(interaction, entry.context)
    }
}