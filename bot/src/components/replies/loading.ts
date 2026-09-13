import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color, Emoji } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

type type = "skip" | "pause" | "resume"

// todo, add loading to each command respectfully
export default function loading({ephemeral, type} : {ephemeral: boolean, type: type}): ReplyPayload {
    const text = type === "pause" ?
        "pausing" : type === "resume" ? 
        "resuming" :
        "skipping"
    
    const container = new ContainerBuilder()
        .setAccentColor(Color.general)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${Emoji.loading} ${text}`))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 | (ephemeral ? MessageFlags.Ephemeral : 0)
    }
}