import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { TrackError } from "../../base/GuildPlayerInstance.js";
import { ButtonExpired } from "../../base/PublicErrors.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";

interface Data {
    track: Track,
    nextTrack: Track
}

export class Skip extends Button<Data> {
    constructor(private once: boolean, context: {manager: ComponentManager, data: Data}) {
        super({
            data: {
                style: ButtonStyle.Secondary,
                label: "skip",
                emoji: Emoji.skipNext
            },
    }, context)
    }

    protected async execute(interaction: ButtonInteraction, {track, nextTrack}: Data): Promise<void> {
        await interaction.deferUpdate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        if (this.once) {
            this.invalidate()
            if (player.state.queue[0] && player.state.queue[0].uuid !== nextTrack.uuid) {
                throw new ButtonExpired()
            }
        }

        try {
            const newTrack = await player.skip()

            if (newTrack) {
                await interaction.editReply(MusicReplies.skipped(newTrack))
                return 
            }
            
            await interaction.editReply(MusicReplies.empty)
        
        } catch (error) {
            if (error instanceof TrackError) {
                await interaction.editReply(MusicReplies.trackError(error.track, error.nextTrack, interaction.client.componentManager))
                return
            }

            // re throw unkown
            throw error
        }
    }
}