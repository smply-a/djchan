import { ApplicationCommandType, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import loading from "../components/replies/loading.js";
import paused from "../components/replies/paused.js";


export class Pause extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "pause",
            type: ApplicationCommandType.ChatInput,
            description: "pauses stream"
        })
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const [player] = await Promise.all([
            this.getPlayerAccess(interaction), 
            interaction.reply(loading({ephemeral: false}))
        ])

        player.pause()
        await interaction.editReply(paused())
    }
}