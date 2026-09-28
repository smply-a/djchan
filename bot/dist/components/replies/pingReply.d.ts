import type { ReplyPayload } from "../../types/index.js";
export default function pingReply(args: {
    state: "loading";
} | {
    state: "result";
    ping: number;
}): ReplyPayload;
