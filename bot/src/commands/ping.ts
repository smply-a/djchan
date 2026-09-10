import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import PingReply from "../components/replies/PingReply.js";

export class Ping extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "ping",
            type: ApplicationCommandType.ChatInput,
            description: "pings the server"
        })
    }

    // TODO make multiple pings to calc average
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.reply(PingReply({type: "loading"}))

        const firstReply = await interaction.fetchReply()
        const ping = firstReply.createdTimestamp - interaction.createdTimestamp

        await interaction.editReply(PingReply({type: "result", ping}))
    }
}