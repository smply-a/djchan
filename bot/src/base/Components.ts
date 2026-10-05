import { randomUUID } from "crypto";
import { ButtonBuilder, ButtonInteraction, ComponentType, type InteractionButtonComponentData } from "discord.js";
import type { ComponentManager } from "./ComponentManager.js";
import { Logger } from "./Logger.js";

// ? buttons that are independant from the message they belong to
// only for logic buttons (with callback), link buttons directly over builder

export abstract class Button<Context> {
    #logger?: Logger
        public get logger(): Logger {
            return this.#logger ??= new Logger({
                type: "button",
                origin: this.data.customId
            })
        }
    
    protected manager: ComponentManager
    private readonly data: InteractionButtonComponentData

    constructor(button: {
        data: Omit<InteractionButtonComponentData, "customId" | "type">,
    }, handling: {
        manager: ComponentManager,
        context: Context
    }) {
        const uuid = randomUUID()

        this.data = {
            ...button.data,
            customId: uuid,
            type: ComponentType.Button
        }

        this.manager = handling.manager

        handling.manager.register(this, handling.context)
    }

    public get customId() {
        return this.data.customId
    }

    public get component() {
        return new ButtonBuilder(this.data)
    }

    protected abstract execute(interaction: ButtonInteraction, context: Context): Promise<void>;

    public async run(interaction: ButtonInteraction, context: Context) {
        await this.execute(interaction, context)
    }

    

    delete() {
        this.manager.delete(this)
    }
}