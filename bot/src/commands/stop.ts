import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import loading from "../components/replies/loading.js";
import stopped from "../components/replies/stopped.js";

export class Stop extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "stop",
            type: ApplicationCommandType.ChatInput,
            description: "stops stream and clears queue"
        })
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const [player] = await Promise.all([
            this.getPlayerAccess(interaction), 
            interaction.reply(loading({ephemeral: false}))
        ])

        player.stop()
        await interaction.editReply(stopped())
    }
}