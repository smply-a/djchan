import type { Track } from "@app/player";
import type { ReplyPayload } from "../../types/index.js";
export default function pauseReply(args: {
    state: "loading";
} | {
    state: "paused";
    track: Track;
}): ReplyPayload;
