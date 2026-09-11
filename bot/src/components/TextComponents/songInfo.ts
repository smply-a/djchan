import type { Track } from "@app/player";
import { getDurationString } from "@app/shared";
import { SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";

export function songInfo({track, size} : {track: Track, size: "primary" | "secondary"}) {
    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${size === "primary" ? "##" : "####"} [${track.title}](${track.url})\n` +
            `by ${track.interpret} · ` + `\`${getDurationString(track.duration)}\``
        ))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
}