import { type ApplicationCommandType, type ChatInputApplicationCommandData, type ChatInputCommandInteraction, type MessageApplicationCommandData, type MessageContextMenuCommandInteraction, type PrimaryEntryPointCommandData, type PrimaryEntryPointCommandInteraction, type UserApplicationCommandData, type UserContextMenuCommandInteraction } from "discord.js";
import { Logger } from "./Logger.js";
type CommandTypeMap = {
    [ApplicationCommandType.ChatInput]: {
        data: ChatInputApplicationCommandData;
        interaction: ChatInputCommandInteraction;
    };
    [ApplicationCommandType.Message]: {
        data: MessageApplicationCommandData;
        interaction: MessageContextMenuCommandInteraction;
    };
    [ApplicationCommandType.User]: {
        data: UserApplicationCommandData;
        interaction: UserContextMenuCommandInteraction;
    };
    [ApplicationCommandType.PrimaryEntryPoint]: {
        data: PrimaryEntryPointCommandData;
        interaction: PrimaryEntryPointCommandInteraction;
    };
};
export declare abstract class Command<T extends keyof CommandTypeMap = keyof CommandTypeMap> {
    #private;
    readonly data: CommandTypeMap[T]["data"] & {
        type: T;
    };
    constructor(data: CommandTypeMap[T]["data"] & {
        type: T;
    });
    id?: string;
    protected abstract execute(interaction: CommandTypeMap[T]["interaction"]): Promise<void>;
    run(interaction: CommandTypeMap[T]["interaction"]): Promise<void>;
    get logger(): Logger;
    protected deleteReply(seconds: number, interaction: ChatInputCommandInteraction): Promise<void>;
}
export {};
