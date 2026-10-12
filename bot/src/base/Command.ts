import { type ApplicationCommandType, type ChatInputApplicationCommandData, type ChatInputCommandInteraction, type MessageApplicationCommandData, type MessageContextMenuCommandInteraction, type PrimaryEntryPointCommandData, type PrimaryEntryPointCommandInteraction, type UserApplicationCommandData, type UserContextMenuCommandInteraction } from "discord.js";
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

type CommandType = "music" | "general"
interface CommandInfo {
    description: string
    syntax: string,
    group: CommandType
}

export abstract class Command<T extends keyof CommandTypeMap = keyof CommandTypeMap> {
    constructor(
        public readonly data: CommandTypeMap[T]["data"] & {type: T},
        public readonly info: CommandInfo
    ) {}
    // to make command clickable in help
    private id?: string
    public setId(id:string) {
        this.id = id
    }

    // for visualisation and help
    //public icon:


    // implementation of command
    protected abstract execute(interaction: CommandTypeMap[T]["interaction"]): Promise<void>

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
    public getClickableString() {
        if (!this.id) throw new Error("Clickable command not accessible since id was missing")
        return `</${this.data.name}:${this.id}>`
    }
}
