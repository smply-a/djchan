import type { Track } from "@app/player";
import type { ReplyPayload } from "../../types/index.js";
export default function skipped(args: {
    state: "skipped";
    track: Track;
} | {
    state: "loading";
}): ReplyPayload;
