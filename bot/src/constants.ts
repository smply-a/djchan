import { MessageFlags } from "discord.js";

export enum Color {
    
    bot = 0xFFA3FD,
    error = 0xc33149,
}

export enum Emoji {
    error = "<:error:1555184333088891010>",
    loading = "<a:loadingbeta:1548781532590776420>",

    pause = "<:pause:1555183306906009630>",
    play = "<:play:1555182791220666381>",
    queued = "<:queued:1555181787469185165>",
    skipNext = "<:skip_next:1555184596482662484>",
}

export const defaultReplyFlags = MessageFlags.IsComponentsV2
export const ephemeralReplyFlags = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral