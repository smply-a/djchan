import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export default function PingReply(args: {type: "loading"} | {type: "result", ping: number}): ReplyPayload {
    const message = args.type === "loading" 
        ? "### pinging server..." 
        : `### Ping: \`${args.ping}\`ms`

    const container = new ContainerBuilder()
        .setAccentColor(Color.general)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(message))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    }
}