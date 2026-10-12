import { ButtonInteraction, ButtonStyle } from "discord.js";
import type { ComponentManager } from "../../base/Components.js";
import { Button } from "../../base/Components.js";
import { Duration, Emoji } from "../../constants.js";
import { deleteReply } from "../../utils.js";
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
        const manager = interaction.client.componentManager

        let reply
        if (this.type === "resume") {
            player.resume()
            reply = await interaction.editReply(MusicReplies.resume())
        } else {
            player.pause()
            reply = await interaction.editReply(MusicReplies.pause(manager))
        }
        // todo make binding to song a buttons protected prob
        this.invalidate()

        deleteReply(Duration.tempMessages, reply)
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