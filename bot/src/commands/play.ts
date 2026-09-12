import { ytdlp } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import loading from "../components/replies/loading.js";
import nowPlaying from "../components/replies/nowPlaying.js";
import resumed from "../components/replies/resumed.js";
import songSearch from "../components/replies/songSearch.js";

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

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const query = interaction.options.getString("query");

        // resume
        if (!query) {
            const [player] = await Promise.all([
                this.getPlayerAccess(interaction), 
                interaction.reply(loading({ephemeral: false}))
            ])
            player.resume()
            await interaction.editReply(resumed())
            return
        }

        await interaction.reply(songSearch({type: "searching", query}))

        const [track, player] = await Promise.all([
            ytdlp.getTrack(query),
            this.getOrCreatePlayerAccess(interaction)
        ])
        
        // await interaction.editReply(SongSearch({type: "found", track}))

        const inQueue = player.addTrack(track)

        if (inQueue) {
            await interaction.editReply(songSearch({type: "queued", track}))
            return
        }

        await interaction.editReply(nowPlaying({type: "nowPlaying", track}))
    }
}