import { randomUUID } from "crypto";
import { ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ComponentType, InteractionResponse, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction, Message, RoleSelectMenuBuilder, RoleSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction, type ChannelSelectMenuComponentData, type InteractionButtonComponentData, type MentionableSelectMenuComponentData, type RoleSelectMenuComponentData, type StringSelectMenuComponentData, type UserSelectMenuComponentData } from "discord.js";
import type { ComponentManager } from "./ComponentManager.js";
import { Logger } from "./Logger.js";

// ? buttons that are independant from the message they belong to
// only for logic buttons (with callback), link buttons directly over builder

// export type ComponentInvalidationType = "changeQueue" | "changePlayback" | "none"

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

    protected async deleteReply(seconds: number, message: Message | InteractionResponse) {
        setTimeout(() => {
            void message.delete().catch(()=>{})
        }, seconds * 1000)
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