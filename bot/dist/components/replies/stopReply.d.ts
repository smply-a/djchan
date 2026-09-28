import type { ReplyPayload } from "../../types/index.js";
export default function stopReply(args: {
    state: "stopped";
} | {
    state: "loading";
}): ReplyPayload;
