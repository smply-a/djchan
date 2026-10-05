import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import { MusicReplies } from "../components/replies/music.js";


export class Skip extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "skip",
            type: ApplicationCommandType.ChatInput,
            description: "skips stream"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        
        await interaction.deferReply()
        const {player} = await interaction.client.players.getPlayerGuarded(interaction)

        const track = player.skip()
        if (!track) {
            interaction.editReply(MusicReplies.empty)
            return
        }

        await interaction.editReply(MusicReplies.skipped(track))
    }
}