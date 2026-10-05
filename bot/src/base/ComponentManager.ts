import { MessageComponentInteraction, type RepliableInteraction } from "discord.js";
import { Button, type MessageComponent } from "./Components.js";
import { Logger } from "./Logger.js";
import { ButtonExpired } from "./PublicErrors.js";

export class ComponentManager {
    private components = new Map<string, {component: MessageComponent<any, unknown>, context: unknown, timeout: NodeJS.Timeout}>()
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

    //todo use guild id for invalidate components stuff
    public register<T>(component: MessageComponent<any, T>, context: T, guildId: string) {
        //prevent memory leak
        const timeout = setTimeout(() => {
            this.components.delete(component.customId)
        }, this.timeout * 1000)

        timeout.unref()

        this.components.set(component.customId, {component, context, timeout})
        this.logger.log(`added component to handle: ${component.customId}`)
    }

    public delete(component: MessageComponent<any, unknown>) {
        const entry = this.components.get(component.customId);
        if (entry) {
            clearTimeout(entry.timeout);
            this.components.delete(component.customId);
        }
        this.logger.log(`removed component to handle: ${component.customId}`)
    }

    public async handleComponent(interaction: RepliableInteraction & MessageComponentInteraction) {
        const id = interaction.customId

        const entry = this.components.get(id)
        if (!entry) throw new ButtonExpired()

        if (entry.component instanceof Button && interaction.isButton()) {
            await entry.component.run(interaction, entry.context)
            return
        }

        throw new Error("Could not handle component interaction")
    }
}