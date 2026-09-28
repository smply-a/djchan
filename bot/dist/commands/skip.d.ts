import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
export declare class Skip extends Command<ApplicationCommandType.ChatInput> {
    constructor();
    protected execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}
