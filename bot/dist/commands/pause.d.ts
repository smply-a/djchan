import { ApplicationCommandType, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
export declare class Pause extends Command<ApplicationCommandType.ChatInput> {
    constructor();
    protected execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}
