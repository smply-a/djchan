import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { ButtonExpired } from "../../base/PublicErrors.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";

export class PlayNext extends Button<Track> {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super({
            data: {
                label: "play next",
                emoji: Emoji.queued_next,
                style: ButtonStyle.Secondary,
            },
    }, context)
    }

    protected async execute(interaction: ButtonInteraction, track: Track): Promise<void> {
        await interaction.deferUpdate()

        const {player} = await interaction.client.players.getPlayerGuarded(interaction)

        const index = player.getTrackIndex(track)

        // invalidate themself
        if (index <= 1) {
            throw new ButtonExpired()
        }

        player.deleteTrack(index)
        // ! safe because it is not played so cant fail
        const result = await player.insertTrack(track, 1)
        
        this.invalidate()
        await interaction.followUp(MusicReplies.move(track, index, 1))
    }
}