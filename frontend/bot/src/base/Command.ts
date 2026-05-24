import type { ApplicationCommandType, Awaitable, ChatInputApplicationCommandData, ChatInputCommandInteraction, MessageApplicationCommandData, MessageContextMenuCommandInteraction, PrimaryEntryPointCommandData, PrimaryEntryPointCommandInteraction, UserApplicationCommandData, UserContextMenuCommandInteraction } from "discord.js";
import { Logger } from "./Logger.js";

type CommandTypeMap = {
    [ApplicationCommandType.ChatInput]: {
        data: ChatInputApplicationCommandData
        interaction: ChatInputCommandInteraction
    },
    [ApplicationCommandType.Message]: {
        data: MessageApplicationCommandData,
        interaction: MessageContextMenuCommandInteraction
    }, 
    [ApplicationCommandType.User]: {
        data: UserApplicationCommandData,
        interaction: UserContextMenuCommandInteraction,
    },
    [ApplicationCommandType.PrimaryEntryPoint]: {
        data: PrimaryEntryPointCommandData,
        interaction: PrimaryEntryPointCommandInteraction,
    }

}

export abstract class Command<T extends keyof CommandTypeMap = keyof CommandTypeMap> {
    constructor(public readonly data: CommandTypeMap[T]["data"] & {type: T}) {}
    public abstract execute(interaction: CommandTypeMap[T]["interaction"]): Awaitable<void>
    
    // to make command clickable in help
    public id?: string

    // for visualisation and help
    //public icon:

    // lazy init
    #logger?: Logger
    protected get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "command",
            origin: this.data.name
        })
    }

    protected async deferReply(interaction: ChatInputCommandInteraction) {
        return await interaction.reply("loading...")
        //TODO better loading screen
    }
}
