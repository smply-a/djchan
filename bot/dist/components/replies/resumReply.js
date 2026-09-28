import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
export default function resumeReply(args) {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot);
    switch (args.state) {
        case "loading": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### resuming"));
            break;
        }
        case "resumed": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### resumed"));
            break;
        }
    }
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}
