import { ytdlp } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import nowPlaying from "../components/replies/nowPlaying.js";
import resumeReply from "../components/replies/resumReply.js";
import songSearch from "../components/replies/songSearch.js";
export class Play extends Command {
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
    async execute(interaction) {
        const query = interaction.options.getString("query");
        // resume
        if (!query) {
            await interaction.reply(resumeReply({ state: "loading" }));
            const player = await interaction.client.players.getPlayerGuarded(interaction);
            const track = player.resume();
            await interaction.editReply(resumeReply({ state: "resumed", track }));
            this.deleteReply(60, interaction);
            return;
        }
        await interaction.reply(songSearch({ state: "searching", query }));
        const [track, player] = await Promise.all([
            ytdlp.getTrack(query),
            interaction.client.players.getOrCreateGuarded(interaction)
        ]);
        // await interaction.editReply(SongSearch({type: "found", track}))
        const inQueue = player.addTrack(track);
        if (inQueue) {
            await interaction.editReply(songSearch({ state: "queued", track }));
            return;
        }
        await interaction.editReply(nowPlaying({ state: "nowPlaying", track }));
    }
}
