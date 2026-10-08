import { MessageFlags } from "discord.js";

export enum Color {
    bot = 0xFFA3FD,
    error = 0xc33149,
}

export enum Emoji {
    error = "<:error:1555184333088891010>",
    loading = "<a:loading:1557030148472311901>",
    internet = "<:internet:1557725584526807080>",
    arrow_right = "<:move:1556810450312630303>",

    pause = "<:pause:1555183306906009630>",
    play = "<:play:1555182791220666381>",
    stop = "<:stop:1556806201747185825>",
    queued = "<:queued:1555181787469185165>",
    queued_next = "<:queued_next:1556794793672319028>",
    skipNext = "<:skip_next:1555184596482662484>",
}

export enum Image {
    // error = "",
    loading = "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?utm_source=de.wikipedia.org&utm_campaign=index&utm_content=original",

}

export const defaultReplyFlags = MessageFlags.IsComponentsV2
export const ephemeralReplyFlags = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral