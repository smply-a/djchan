import type { Track } from "@app/player";
import { getDurationString, viewString } from "@app/shared";
import { SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";

export function songInfo({track} : {track: Track}) {
    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${`## [${track.title}](${track.url})`}\n` +
            `by ${track.interpret}` + "   •   " + `${getDurationString(track.duration)}` + "   •   " + `${viewString(track.view_count)} views` 
        ))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
}