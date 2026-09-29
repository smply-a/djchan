import type { Track } from "@app/player";
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";


export function resumeReply(
    args : {state: "resumed", track: Track} | {state: "loading"}
): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
    
    switch (args.state) {
        case "loading": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### resuming"))
            break
        }
        case "resumed": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### resumed"))
            break
        }
    }

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}