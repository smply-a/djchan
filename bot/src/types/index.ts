import type { InteractionReplyOptions, InteractionEditReplyOptions } from "discord.js";

export * from "./PublicErrors.js";

export type ReplyPayload = InteractionReplyOptions & InteractionEditReplyOptions
