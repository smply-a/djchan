import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import { pingReply } from "../components/replies/ping.js";

export class Ping extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "ping",
            type: ApplicationCommandType.ChatInput,
            description: "pings the server and returns latency"
        })
    }

    // TODO make multiple pings to calc average
    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.reply(pingReply({state: "loading"}))

        const firstReply = await interaction.fetchReply()
        const ping = firstReply.createdTimestamp - interaction.createdTimestamp

        await interaction.editReply(pingReply({state: "result", ping}))
    }
}