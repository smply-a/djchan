import type { Track } from "@app/player";
import { getDurationString } from "@app/shared";
import { ContainerBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export default function NowPlaying(args: 
    {type: "nowPlaying", track: Track} | 
    {type: "skipped", track: Track}
): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.player);

    const {type, track} = args
    const songInfo =
            `## [${track.title}](${track.url})\n` +
            `**${track.interpret}**\n` +
            `\`${getDurationString(track.duration)}\``
    
    let textDisplay: TextDisplayBuilder
    
    switch (type) {
        case "nowPlaying": {
            textDisplay = new TextDisplayBuilder().setContent(
                "### Now Playing\n" +
                songInfo
            )

            break
        }
        case "skipped": {
            textDisplay = new TextDisplayBuilder().setContent(
                "### Skipped to\n" +
                songInfo
            )

            break
        }
    }

    const section = new SectionBuilder()
        .addTextDisplayComponents(textDisplay)
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))

    container.addSectionComponents(section);

    //container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}