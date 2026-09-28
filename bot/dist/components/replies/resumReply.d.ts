import type { Track } from "@app/player";
import type { ReplyPayload } from "../../types/index.js";
export default function resumeReply(args: {
    state: "resumed";
    track: Track;
} | {
    state: "loading";
}): ReplyPayload;
