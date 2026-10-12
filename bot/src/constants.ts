import { MessageFlags } from "discord.js";

export enum Color {
    bot = 0xFFA3FD,
    error = 0xc33149,
}

export enum Emoji {
    error = "<:error:1555184333088891010>",
    loading = "<a:loading:1557030148472311901>",
    internet = "<:internet:1557725584526807080>",
    arrow_right = "<:arrow_right:1556810450312630303>",
    arrow_left = "<:arrow_left:1557911451841339433>",
    retry = "<:retry:1558553715311644682>",
    delete = "<:delete:1558920311892615179>",
    info = "<:info:1555191567306727424>",
    notes = "<:notes:1555182241624236032>",
    home ="<:home:1559279881131532370>",

    pause = "<:pause:1555183306906009630>",
    play = "<:play:1555182791220666381>",
    stop = "<:stop:1556806201747185825>",
    queued = "<:queued:1555181787469185165>",
    queued_next = "<:queued_next:1556794793672319028>",
    skipNext = "<:skip_next:1555184596482662484>",
}

export enum Image {
    helpMain = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAFez2p49Ul2KT5WxD6ELaobRBz43JPKZHrYKJ79PBNF-2c364hEsalD2X&s=10"
}

export const defaultReplyFlags = MessageFlags.IsComponentsV2
export const ephemeralReplyFlags = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral

export enum Duration {
    tempMessages = 5*60
}