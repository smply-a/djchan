import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import { TrackError } from "../base/GuildPlayerInstance.js";
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
        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        try {
            const newTrack = await player.skip()

            await interaction.editReply(MusicReplies.skipped(newTrack))
        
        } catch (err) {
            if (err instanceof TrackError) {
                await interaction.editReply(MusicReplies.trackError(err, interaction.client.componentManager))
                return
            }
            
            // re throw unkwon err
            throw err
        }
        
    }
}