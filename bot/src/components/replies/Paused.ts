import type { Track } from "@app/player";
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export default function paused(track: Track): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.general)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("### paused"))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}