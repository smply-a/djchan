import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/Components.js";
import { Button } from "../../base/Components.js";
import { TrackError } from "../../base/GuildPlayerInstance.js";
import { ButtonExpired } from "../../base/PublicErrors.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";

// todo mabe make queue have a pointer that floats around so you can skip back etc

interface Data {
    track: Track,
    nextTrack: Track
}

export class Skip extends Button<Data> {
    constructor(private mode: "bindTrack" | "normal", context: {manager: ComponentManager, data: Data}) {
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

        if (this.mode == "bindTrack") {
            this.invalidate()
            if (player.state.queue[0] && player.state.queue[0].uuid !== nextTrack.uuid) {
                throw new ButtonExpired()
            }
        }

        try {
            const newTrack = await player.skip()

            const reply = await interaction.editReply(MusicReplies.skipped(newTrack))
            
            this.deleteReply(5*60, reply)
        
        } catch (error) {
            if (error instanceof TrackError) {
                const reply = await interaction.editReply(MusicReplies.trackError(error, interaction.client.componentManager))
                this.deleteReply(5*60, reply)
                return
            }

            // re throw unkown
            throw error
        }
    }
}