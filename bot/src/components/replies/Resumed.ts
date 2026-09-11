import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export default function Resumed(): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.general)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("### resumed"))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}