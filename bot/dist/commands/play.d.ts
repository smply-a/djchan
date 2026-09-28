import { ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
export declare class Play extends Command<ApplicationCommandType.ChatInput> {
    constructor();
    protected execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
