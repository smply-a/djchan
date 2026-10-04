import { ApplicationCommandType, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import { MusicReplies } from "../components/replies/music.js";


export class Pause extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "pause",
            type: ApplicationCommandType.ChatInput,
            description: "pauses stream"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply()
        const player = await interaction.client.players.getPlayerGuarded(interaction)

        const track = player.pause()
        await interaction.editReply(MusicReplies.pause(interaction.client.componentManager))

        this.deleteReply(5*60, interaction)
    }
}