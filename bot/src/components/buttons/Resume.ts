import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { MusicReplies } from "../replies/music.js";

export class Resume extends Button<null> {
    constructor(handling: {manager: ComponentManager, guildId: string}) {
        super({
            data: {
                label: "resume",
                style: ButtonStyle.Secondary,
            },
            invalidateOn: "none"
    }, {...handling, context: null})
    }

    protected async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferUpdate()

        const {player} = await interaction.client.players.getPlayerGuarded(interaction)

        player.resume()
        
        this.delete()
        await interaction.editReply(MusicReplies.resume)
    }
}