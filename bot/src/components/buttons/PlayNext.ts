import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { MusicReplies } from "../replies/music.js";

interface Context {
    track: Track, 
    index: number
}

export class PlayNext extends Button<Context> {
    constructor(handling: {manager: ComponentManager, context: Context}) {
        super({data: {
            label: "play next",
            style: ButtonStyle.Success,
        }}, handling)
    }

    protected async execute(interaction: ButtonInteraction, {track, index}: Context): Promise<void> {
        await interaction.deferUpdate()

        const player = await interaction.client.players.getPlayerGuarded(interaction)

        player.delete(index)
        player.insert(track, 1)
        
        await interaction.editReply(MusicReplies.move(track, 1))
        this.delete()
    }
}