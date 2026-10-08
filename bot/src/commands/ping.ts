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
        const gatewayPing = Math.max(0, interaction.client.ws.ping)
        
        await interaction.reply(pingReply({state: "loading", try: 1}))

        const tries = 5

        const reply = await interaction.fetchReply()
        const pings = [reply.createdTimestamp - interaction.createdTimestamp]

        for (let i = 2; i <= tries; i++) {
            const start = performance.now();

            await interaction.editReply(pingReply({state: "loading", try: i})) 

            const end = performance.now();

            pings.push(end - start)
        }

        // calc average
        const ping = Math.round(pings.reduce((a,b) => a + b) / pings.length)

        await interaction.editReply(pingReply({state: "result", ping, tries, dicordAPI: gatewayPing}))
    }
}