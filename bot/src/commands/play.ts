
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import { SearchError, TrackError } from "../base/GuildPlayerInstance.js";
import { MusicReplies } from "../components/replies/music.js";
import { Duration } from "../constants.js";
import { deleteReply } from "../utils.js";

export class Play extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "play",
            description: "play song | resume stream",
            type: ApplicationCommandType.ChatInput,
            options: [{
                name: "query",
                description: "youtube url   |   search query",
                type: ApplicationCommandOptionType.String,
                required: false
            }]
        }, {
            group: "music",
            description: "This command either **adds songs** to the queue or works as **resume**\n* To add songs, you can specify either a yt link or a query to search directly on yt\n* If nothing is provided, play will act as **resume**",
            syntax: "/play (link or query)"
        });
    }

    protected async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const query = interaction.options.getString("query");

        // resume
        if (!query) {
            await interaction.deferReply()
            const {player} = await interaction.client.players.getPlayerGuarded(interaction) 

            const track = player.resume()

            const reply = await interaction.editReply(MusicReplies.resume())
            deleteReply(Duration.tempMessages, reply)
            return
        }
        
        const { player, guildId } = await interaction.client.players.getOrCreateGuarded(interaction);
        const manager = interaction.client.componentManager

        // search
        await interaction.reply(MusicReplies.request({state: "searching", query}))

        try {
            // to do new error if track cant be foun pc u cant pass track
            const track = await player.search(query)
            
            // show search result
            // await interaction.editReply(MusicReplies.request({state: "result", track}))


            const result = await player.addTrack(track)

            if (result.inQueue) {
                await interaction.editReply(MusicReplies.queued(track, result.index, manager))
            } else {
                await interaction.editReply(MusicReplies.start(track, manager))
            }
        
        } catch (error) {

            // todo handle player errors function
            if (error instanceof TrackError) {
                await interaction.editReply(MusicReplies.trackError(error, manager))
                return
            }

            if (error instanceof SearchError) {
                await interaction.editReply(MusicReplies.searchError(error, manager))
                return
            }

            // re throw unkown error
            throw error
        }
    }
}