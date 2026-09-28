import type { Track } from "@app/player";
import type { ReplyPayload } from "../../types/index.js";
export default function nowPlaying(args: {
    state: "nowPlaying";
    track: Track;
} | {
    state: "skipped";
    track: Track;
}): ReplyPayload;
