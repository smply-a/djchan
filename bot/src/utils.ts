import type { InteractionResponse, Message } from "discord.js"

export function deleteReply(seconds: number, message: Message | InteractionResponse) {
    setTimeout(() => {
        void message.delete().catch(()=>{})
    }, seconds * 1000)
}