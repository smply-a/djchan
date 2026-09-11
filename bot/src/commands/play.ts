import { ytdlp } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import NowPlaying from "../components/replies/NowPlaying.js";
import Resumed from "../components/replies/Resumed.js";
import SongSearch from "../components/replies/SongSearch.js";

export class Play extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "play",
            description: "play song | resume",
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
            const player = await this.getPlayerAccess(interaction)
            player.resume()
            await interaction.reply(Resumed())
            return
        }

        const player = await this.getOrCreatePlayerAccess(interaction)

        await interaction.reply(SongSearch({type: "searching", query}))
        
        const track = await ytdlp.getTrack(query)
        
        // await interaction.editReply(SongSearch({type: "found", track}))

        const inQueue = player.addTrack(track)

        if (inQueue) {
            await interaction.editReply(SongSearch({type: "queued", track}))
            return
        }

        await interaction.editReply(NowPlaying({type: "nowPlaying", track}))
    }
}