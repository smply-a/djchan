import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import { MusicReplies } from "../components/replies/music.js";

export class Stop extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "stop",
            type: ApplicationCommandType.ChatInput,
            description: "stops stream and clears queue"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply()
        const {player} = await interaction.client.players.getPlayerGuarded(interaction)
        
        player.stop()
        player.tryDisconnect()
        await interaction.editReply(MusicReplies.stopped)
    }
}