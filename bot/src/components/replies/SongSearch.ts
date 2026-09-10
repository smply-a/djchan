import type { Track } from "@app/player";
import { getDurationString } from "@app/shared";
import { ContainerBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

export default function SearchSong(
    args: {type: "searching", query: string}
    | {type: "found", track: Track}
    | {type: "queued", track: Track}
): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.player)

    const songInfo = (track: Track) => {
        return (
            `### [${track.title}](${track.url})\n` +
            `**${track.interpret}** | \`${getDurationString(track.duration)}\``
        )
    }

    switch (args.type) {
        case "searching": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### Searching \`${args.query}\``))
            break
        }

        // TODO add cancel button
        case "found": {
            const {track} = args
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "### Found Track:\n" + songInfo(track)
                        
                    )
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))

            container.addSectionComponents(section)
            break
        }

        // TODO add queue move buttons, PLAY NOW button
        case "queued": {
            const {track} = args
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `### Added to Queue\n` + songInfo(track)
                    )
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
            
                container.addSectionComponents(section)
            break
        }
    }

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 | (args.type === "queued" ? 0 : MessageFlags.Ephemeral)
    }
}