import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";

export class Ping extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "ping",
            type: ApplicationCommandType.ChatInput,
            description: "pings the server"
        })
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        this.deferReply(interaction)

        const firstReply = await interaction.fetchReply()
        const ping = firstReply.createdTimestamp - interaction.createdTimestamp

        interaction.editReply(`ping: ${ping}`)
    }
}