import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { ButtonExpired } from "../../base/PublicErrors.js";
import { MusicReplies } from "../replies/music.js";

interface Context {
    track: Track
}

export class PlayNext extends Button<Context> {
    constructor(handling: {manager: ComponentManager, context: Context, guildId: string}) {
        super({
            data: {
                label: "play next",
                style: ButtonStyle.Success,
            },
            invalidateOn: "none"
    }, handling)
    }

    protected async execute(interaction: ButtonInteraction, {track}: Context): Promise<void> {
        await interaction.deferUpdate()

        const {player} = await interaction.client.players.getPlayerGuarded(interaction)

        const index = player.getTrackIndex(track)

        // invalidate themself
        if (index <= 1) {
            this.delete()
            throw new ButtonExpired()
        }

        player.deleteTrack(index)
        player.insertTrack(track, 1)
        
        this.delete()
        await interaction.editReply(MusicReplies.move(track, 1))
    }
}