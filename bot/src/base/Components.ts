import { randomUUID } from "crypto";
import { ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ComponentType, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction, RoleSelectMenuBuilder, RoleSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction, type ChannelSelectMenuComponentData, type InteractionButtonComponentData, type MentionableSelectMenuComponentData, type RoleSelectMenuComponentData, type StringSelectMenuComponentData, type UserSelectMenuComponentData } from "discord.js";
import type { ComponentManager } from "./ComponentManager.js";
import { Logger } from "./Logger.js";

// ? buttons that are independant from the message they belong to
// only for logic buttons (with callback), link buttons directly over builder

export type ComponentInvalidationType = "changeQueue" | "changePlayback" | "none"

export abstract class MessageComponent<T extends keyof ComponentMap, Context> {
    #logger?: Logger;
    public abstract get logger(): Logger

    public readonly invalidateOn: ComponentInvalidationType;
    public readonly customId: string;
    protected manager: ComponentManager;
    protected readonly data: ComponentMap[T]["data"] & { customId: string, type: T };

    constructor(
        type: T,
        componentData: {data: ComponentMap[T]["data"], invalidateOn: ComponentInvalidationType},
        handling: { manager: ComponentManager; context: Context; guildId: string; },
    ) {
        this.customId = randomUUID();
        this.manager = handling.manager;
        this.invalidateOn = componentData.invalidateOn

        this.data = {
            ...componentData.data,
            customId: this.customId,
            type: type
        }

        handling.manager.register(this, handling.context, handling.guildId);
    }

    public abstract get component(): ComponentMap[T]["builder"];

    protected abstract execute(
        interaction: ComponentMap[T]["interaction"], 
        context: Context
    ): Promise<void>;

    public async run(
        interaction: ComponentMap[T]["interaction"], 
        context: Context
    ) {
        await this.execute(interaction, context);
    }

    public delete() {
        this.manager.delete(this);
    }
}

export abstract class Button<Context> extends MessageComponent<ComponentType.Button, Context> {
    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "button",
            origin: this.data.customId
        })
    }

    constructor(button: {
        data: Omit<InteractionButtonComponentData, "customId" | "type">,
        invalidateOn: ComponentInvalidationType
    }, handling: {
        manager: ComponentManager,
        context: Context,
        guildId: string
    }) {
        super(ComponentType.Button, button, handling)
    }

    public get component() {
        return new ButtonBuilder(this.data)
    }

    protected abstract execute(interaction: ButtonInteraction, context: Context): Promise<void>;
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