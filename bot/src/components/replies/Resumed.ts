import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";
import type { Track } from "@app/player";

export default function resumed(track: Track): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.general)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("### resumed"))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}