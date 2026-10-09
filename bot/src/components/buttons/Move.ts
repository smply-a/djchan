import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle, type InteractionButtonComponentData } from "discord.js";
import type { ComponentManager } from "../../base/Components.js";
import { Button } from "../../base/Components.js";
import { TrackError } from "../../base/GuildPlayerInstance.js";
import { ButtonExpired } from "../../base/PublicErrors.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";


class Move extends Button<Track> {
    constructor(private index: number, button: Omit<InteractionButtonComponentData, "customId" | "type">, context: {manager: ComponentManager, data: Track}) {
        super({data: button}, context)
    }

    protected async execute(interaction: ButtonInteraction, track: Track): Promise<void> {
        await interaction.deferUpdate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        const index = player.getTrackIndex(track)
        // invalidate themself
        if (index <= this.index) {
            this.invalidate()
            throw new ButtonExpired()
        }

        player.deleteTrack(index)
        try {
            await player.insertTrack(track, this.index)
            const reply = await interaction.followUp(MusicReplies.move(track, index, this.index))

            this.deleteReply(5*60, reply)
        
        } catch (error) {
            if (error instanceof TrackError) {
                const reply = await interaction.editReply(MusicReplies.trackError(error, interaction.client.componentManager))
                this.deleteReply(5*60, reply)
                return
            }

            throw error
        }
    }
}

export class PlayNext extends Move {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super(1, {
            label: "play next",
            emoji: Emoji.queued_next,
            style: ButtonStyle.Secondary
        }, context)
    }
}

export class PlayNow extends Move {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super(0, {
            label: "play",
            emoji: Emoji.play,
            style: ButtonStyle.Secondary
        }, context)
    }
}