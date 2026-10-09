import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/Components.js";
import { Button } from "../../base/Components.js";
import { Emoji } from "../../constants.js";
import { MusicReplies } from "../replies/music.js";

class Playback extends Button<null> {
    constructor(private type: "resume" | "pause", context: {manager: ComponentManager}) {
        const label = type === "resume" ? "resume" : "pause"
        const emoji = type === "resume" ? Emoji.play : Emoji.pause
        
        super({
            data: {
                style: ButtonStyle.Secondary,
                label,
                emoji
            },
    }, {...context, data: null})
    }

    protected async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferUpdate()

        const {player} = await interaction.client.players.getPlayerGuarded(interaction)


        if (this.type === "resume") {
            player.resume()
        } else {
            player.pause()
        }
        // todo make binding to song a buttons protected prob
        this.invalidate()
        const reply = await interaction.editReply(MusicReplies.resume)

        this.deleteReply(5*60, reply)
    }
}

export class Resume extends Playback {
    constructor(context: {manager: ComponentManager}) {
        super("resume", context)
    }
}

export class Pause extends Playback {
    constructor(context: {manager: ComponentManager}) {
        super("pause", context)
    }
}