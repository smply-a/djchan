import type { Track } from "@app/player";
import type { ReplyPayload } from "../../types/index.js";
export default function searchSong(args: {
    state: "searching";
    query: string;
} | {
    state: "found";
    track: Track;
} | {
    state: "queued";
    track: Track;
}): ReplyPayload;
