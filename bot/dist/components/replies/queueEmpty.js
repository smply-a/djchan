import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
export default function queueEmpty() {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("### queue empty"));
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}
