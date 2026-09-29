import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import { stopReply } from "../components/replies/stopReply.js";

export class Stop extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "stop",
            type: ApplicationCommandType.ChatInput,
            description: "stops stream and clears queue"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.reply(stopReply({state: "loading"}))
        const player = await interaction.client.players.getPlayerGuarded(interaction)
        
        player.stop()
        await interaction.editReply(stopReply({state: "stopped"}))
    }
}