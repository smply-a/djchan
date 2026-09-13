import type { Track } from "@app/player";
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Color } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";
import { songInfo } from "../sections/songInfo.js";

export default function searchSong(
    args: {type: "searching", query: string}
    | {type: "found", track: Track}
    | {type: "queued", track: Track}
): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.player)

    switch (args.type) {
        case "searching": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                "### searching\n" + 
                `\`${args.query}\``
            ))
            break
        }

        // TODO add cancel button
        case "found": {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("### result")
            )
            container.addSectionComponents(songInfo({track: args.track}))
            break
        }

        // TODO add queue move buttons, PLAY NOW button
        case "queued": {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("### queued")
            )
            container.addSectionComponents(songInfo({track: args.track}))
            break
        }
    }

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2 // | (args.type === "queued" ? 0 : MessageFlags.Ephemeral)
    }
}