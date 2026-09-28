import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
export default function pingReply(args) {
    const message = args.state === "loading"
        ? "### pinging server..."
        : `### ping took \`${args.ping}\`ms`;
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(message));
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    };
}
