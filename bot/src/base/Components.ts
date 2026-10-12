import { randomUUID } from "crypto";
import { ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ComponentType, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction, MessageComponentInteraction, RoleSelectMenuBuilder, RoleSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction, type ChannelSelectMenuComponentData, type InteractionButtonComponentData, type MentionableSelectMenuComponentData, type RepliableInteraction, type RoleSelectMenuComponentData, type StringSelectMenuComponentData, type UserSelectMenuComponentData } from "discord.js";
import { Logger } from "./Logger.js";
import { ComponentExpired } from "./PublicErrors.js";



// COMPONENTS
interface ComponentMap {
    [ComponentType.Button]: {
        interaction: ButtonInteraction;
        data: Omit<InteractionButtonComponentData, "customId" | "type">;
        builder: ButtonBuilder;
    };
    [ComponentType.StringSelect]: {
        interaction: StringSelectMenuInteraction;
        data: Omit<StringSelectMenuComponentData, "customId" | "type">;
        builder: StringSelectMenuBuilder;
    };
    [ComponentType.UserSelect]: {
        interaction: UserSelectMenuInteraction;
        data: Omit<UserSelectMenuComponentData, "customId" | "type">;
        builder: UserSelectMenuBuilder;
    };
    [ComponentType.RoleSelect]: {
        interaction: RoleSelectMenuInteraction;
        data: Omit<RoleSelectMenuComponentData, "customId" | "type">;
        builder: RoleSelectMenuBuilder;
    };
    [ComponentType.ChannelSelect]: {
        interaction: ChannelSelectMenuInteraction;
        data: Omit<ChannelSelectMenuComponentData, "customId" | "type">;
        builder: ChannelSelectMenuBuilder;
    };
    [ComponentType.MentionableSelect]: {
        interaction: MentionableSelectMenuInteraction;
        data: Omit<MentionableSelectMenuComponentData, "customId" | "type">;
        builder: MentionableSelectMenuBuilder;
    };
}

interface Context<Data> { 
    manager: ComponentManager; 
    data: Data; 
}

export abstract class MessageComponent<T extends keyof ComponentMap, Data> {
    #logger?: Logger;
    public abstract get logger(): Logger


    public readonly customId: string;
    protected manager: ComponentManager;
    protected readonly data: ComponentMap[T]["data"] & { customId: string, type: T };

    constructor(
        type: T,
        componentData: {data: ComponentMap[T]["data"]},
        context: Context<Data>,
    ) {
        this.customId = randomUUID();
        this.manager = context.manager;

        this.data = {
            ...componentData.data,
            customId: this.customId,
            type: type
        }

        this.manager.register(this, context.data);
    }

    public abstract get component(): ComponentMap[T]["builder"];

    protected abstract execute(
        interaction: ComponentMap[T]["interaction"], 
        data: Data
    ): Promise<void>;

    public async run(
        interaction: ComponentMap[T]["interaction"], 
        data: Data
    ) {
        await this.execute(interaction, data);
    }

    public invalidate() {
        this.manager.delete(this);
    }
}

export abstract class Button<Data> extends MessageComponent<ComponentType.Button, Data> {
    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "button",
            origin: this.data.customId
        })
    }

    constructor(
        button: {data: Omit<InteractionButtonComponentData, "customId" | "type">,}, 
        context: Context<Data>
    ) {
        super(ComponentType.Button, button, context)
    }

    public get component() {
        return new ButtonBuilder(this.data)
    }

    protected abstract execute(interaction: ButtonInteraction, data: Data): Promise<void>;
}

export abstract class StringSelect<Data> extends MessageComponent<ComponentType.StringSelect, Data> {
    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "button",
            origin: this.data.customId
        })
    }

    constructor(
        selectMenu: {data: Omit<StringSelectMenuComponentData, "customId" | "type">,}, 
        context: Context<Data>
    ) {
        super(ComponentType.StringSelect, selectMenu, context)
    }

    public get component() {
        return new StringSelectMenuBuilder(this.data)
    }

    protected abstract execute(interaction: StringSelectMenuInteraction, data: Data): Promise<void>;
}


// MANAGER
export class ComponentManager {
    private components = new Map<string, {component: MessageComponent<any, unknown>, context: unknown, timeout: NodeJS.Timeout}>()
    // scheduled delete map maybe oer linked to a guild etc
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
    // todo add message id, so on reload all the components are removed from the handler 
    // todo (make it that this happens automatically)
    public register<T>(component: MessageComponent<any, T>, context: T) {
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
        if (!entry) throw new ComponentExpired()


        await entry.component.run(interaction, entry.context)
    }
}