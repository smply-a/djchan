import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export default function pingReply(args: {state: "loading"} | {state: "result", ping: number}): ReplyPayload {
    const message = args.state === "loading" 
        ? "### pinging server..." 
        : `### ping took \`${args.ping}\`ms`

    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(message))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    }
}