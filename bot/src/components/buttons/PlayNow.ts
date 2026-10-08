import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { TrackError } from "../../base/GuildPlayerInstance.js";
import { ButtonExpired } from "../../base/PublicErrors.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";


export class PlayNow extends Button<Track> {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super({
            data: {
                label: "play",
                emoji: Emoji.play,
                style: ButtonStyle.Secondary,
            }
    }, context)
    }

    protected async execute(interaction: ButtonInteraction, track: Track): Promise<void> {
        await interaction.deferUpdate()
        this.invalidate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        const index = player.getTrackIndex(track)
        // invalidate themself
        if (index <= 0) {
            throw new ButtonExpired()
        }

        player.deleteTrack(index)
        try {
            await player.insertTrack(track, "now")
            await interaction.followUp(MusicReplies.move(track, index, 0))
        
        } catch (error) {
            if (error instanceof TrackError) {
                await interaction.editReply(MusicReplies.trackError(error.track,error.nextTrack, interaction.client.componentManager))
                return
            }

            throw error
        }
    }
}