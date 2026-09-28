import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import { songInfo } from "../sections/songInfo.js";
export default function nowPlaying(args) {
    const container = new ContainerBuilder().setAccentColor(Color.bot);
    const { state: type, track } = args;
    switch (type) {
        case "nowPlaying": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### now playing"));
            break;
        }
        case "skipped": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### skipped to"));
            break;
        }
    }
    container.addSectionComponents(songInfo({ track }));
    //container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}
