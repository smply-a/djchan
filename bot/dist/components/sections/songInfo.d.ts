import type { Track } from "@app/player";
import { SectionBuilder } from "discord.js";
export declare function songInfo({ track }: {
    track: Track;
}): SectionBuilder;
