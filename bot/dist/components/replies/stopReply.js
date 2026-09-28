import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
export default function stopReply(args) {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot);
    switch (args.state) {
        case "loading": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### stopping"));
            break;
        }
        case "stopped": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### stopped"));
            break;
        }
    }
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}
