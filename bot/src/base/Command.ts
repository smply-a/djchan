import { type ApplicationCommandType, type Awaitable, type ChatInputApplicationCommandData, type ChatInputCommandInteraction, type MessageApplicationCommandData, type MessageContextMenuCommandInteraction, type PrimaryEntryPointCommandData, type PrimaryEntryPointCommandInteraction, type UserApplicationCommandData, type UserContextMenuCommandInteraction } from "discord.js";
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
    constructor(
        public readonly data: CommandTypeMap[T]["data"] & {type: T}
    ) {}
    // to make command clickable in help
    public id?: string

    // for visualisation and help
    //public icon:


    // implementation of command
    protected abstract execute(interaction: CommandTypeMap[T]["interaction"]): Awaitable<void>

    // filter 
    public async run(interaction: CommandTypeMap[T]["interaction"]) {
        await this.execute(interaction)
    }

    // lazy init
    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "command",
            origin: this.data.name
        })
    }

    // utils
    protected async deferReply(interaction: ChatInputCommandInteraction) {
        return await interaction.reply("loading...")
        //TODO better loading screen
    }
}
