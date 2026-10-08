import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";

export class Resume extends Button<null> {
    constructor(context: {manager: ComponentManager}) {
        super({
            data: {
                style: ButtonStyle.Secondary,
                label: "resume",
                emoji: Emoji.play
            },
    }, {...context, data: null})
    }

    protected async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferUpdate()

        const {player} = await interaction.client.players.getPlayerGuarded(interaction)

        player.resume()
        
        this.invalidate()
        const reply = await interaction.editReply(MusicReplies.resume)

        this.deleteReply(5*60, reply)
    }
}