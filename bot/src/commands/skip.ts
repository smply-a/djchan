import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import loading from "../components/replies/loading.js";
import nowPlaying from "../components/replies/nowPlaying.js";
import queueEmpty from "../components/replies/queueEmpty.js";

export class Skip extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "skip",
            type: ApplicationCommandType.ChatInput,
            description: "skips stream"
        })
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const [player] = await Promise.all([
            this.getPlayerAccess(interaction), 
            interaction.reply(loading({ephemeral: false}))
        ])

        const track = player.skip()
        if (!track) {
            interaction.editReply(queueEmpty())
            return
        }

        await interaction.editReply(nowPlaying({type: "skipped", track}))
    }
}