import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import nowPlaying from "./nowPlaying.js";
export default function skipped(args) {
    const container = new ContainerBuilder()
        .setAccentColor(Color.bot);
    switch (args.state) {
        case "loading": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### skipping"));
            break;
        }
        case "skipped": {
            return nowPlaying(args);
        }
    }
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}
