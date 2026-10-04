import { ytdlp } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import { MusicReplies } from "../components/replies/music.js";

export class Play extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "play",
            description: "play song | resume stream",
            type: ApplicationCommandType.ChatInput,
            options: [{
                name: "query",
                description: "youtube url | search query",
                type: ApplicationCommandOptionType.String,
                required: false
            }]
        });
    }

    protected async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const query = interaction.options.getString("query");

        // resume
        if (!query) {
            await interaction.deferReply()
            const player = await interaction.client.players.getPlayerGuarded(interaction) 

            const track = player.resume()

            await interaction.editReply(MusicReplies.resume)
            this.deleteReply(5 * 60, interaction)
            return
        }

        // search
        await interaction.reply(MusicReplies.request({state: "searching", query}))

        const [track, player] = await Promise.all([
            ytdlp.getTrack(query),
            interaction.client.players.getOrCreateGuarded(interaction)
        ])
        
        // await interaction.editReply(SongSearch({type: "found", track}))

        const inQueue = player.addTrack(track)

        if (inQueue) {
            await interaction.editReply(MusicReplies.queue(track))
            return
        }

        await interaction.editReply(MusicReplies.start(track))
    }
}