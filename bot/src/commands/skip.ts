import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import NowPlaying from "../components/replies/NowPlaying.js";

export class Skip extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "skips",
            type: ApplicationCommandType.ChatInput,
            description: "skips song"
        })
    }

    // TODO make multiple pings to calc average
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const player = this.getPlayerAccess(interaction)

        const track = player.skip()
        await interaction.reply(NowPlaying({type: "skipped", track}))
    }
}