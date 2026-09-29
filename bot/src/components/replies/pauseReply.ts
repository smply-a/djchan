import type { Track } from "@app/player";
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";


export function pauseReply(
    args : {state: "loading"} | {state: "paused", track: Track}
): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
    
    switch (args.state) {
        case "loading": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### pausing"))
            break
        }
        case "paused": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### paused"))
            break
        }
    }

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}