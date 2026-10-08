import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color, Emoji } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export function pingReply(args: {state: "loading", try: number} | {state: "result", ping: number, dicordAPI: number, tries: number}): ReplyPayload {
    const message = args.state === "loading" 
        ? `### ${Emoji.loading} pinging server... ${args.try}` 
        : `### ${Emoji.internet} pinged ${args.tries} times\n` + `Response time: \`${args.ping}\`ms\n` + `Discord API: \`${args.dicordAPI}\`ms`

    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(message))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    }
}