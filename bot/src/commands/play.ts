import { ytApi } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import { TrackError } from "../base/GuildPlayerInstance.js";
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
            const {player} = await interaction.client.players.getPlayerGuarded(interaction) 

            const track = player.resume()

            const reply = await interaction.editReply(MusicReplies.resume)
            this.deleteReply(5 * 60, reply)
            return
        }

        // search
        await interaction.reply(MusicReplies.request({state: "searching", query}))

        const [track, {player, guildId}] = await Promise.all([
            ytApi.getTrack(query),
            interaction.client.players.getOrCreateGuarded(interaction)
        ])
        
        // show search result
        await interaction.editReply(MusicReplies.request({state: "result", track}))

        try {
            const result = await player.addTrack(track)

            if (result.inQueue) {
                await interaction.editReply(MusicReplies.queued(track, result.index, interaction.client.componentManager))
            } else {
                await interaction.editReply(MusicReplies.start(track))
            }
        
        } catch (error) {
            if (error instanceof TrackError) {
                await interaction.editReply(MusicReplies.trackError(error, interaction.client.componentManager))
                return
            }

            // re throw unkown error
            throw error
        }
    }
}