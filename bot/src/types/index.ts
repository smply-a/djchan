import type { InteractionEditReplyOptions, InteractionReplyOptions } from "discord.js";

export * from "./PublicErrors.js";

export type ReplyPayload = InteractionReplyOptions & InteractionEditReplyOptions
