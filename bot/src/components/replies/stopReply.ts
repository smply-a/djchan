import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

type State = "loading" | "stopped"

export function stopReply(
    args : {state: "stopped" } | {state: "loading"}
): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
    
    switch (args.state) {
        case "loading": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### stopping"))
            break
        }
        case "stopped": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### stopped"))
            break
        }
    }

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}