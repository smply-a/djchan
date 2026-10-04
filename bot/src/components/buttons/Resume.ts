import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import type { ComponentManager } from "../../base/ComponentManager.js";
import { Button } from "../../base/Components.js";
import { MusicReplies } from "../replies/music.js";

export class Resume extends Button<null> {
    constructor(handling: {manager: ComponentManager}) {
        super({data: {
            type: ComponentType.Button,
            label: "resume",
            style: ButtonStyle.Primary,
        }}, {...handling, context: null})
    }

    protected async execute(interaction: ButtonInteraction): Promise<void> {

        // await interaction.deferReply()

        const player = await interaction.client.players.getPlayerGuarded(interaction)

        player.resume()
        this.delete()
        
        await interaction.update(MusicReplies.resume)
    }
}