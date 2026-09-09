import { ytdlp } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import { MemberNotConnected, OnlyInGuild } from "../types/PublicErrors.js";

export class Play extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "play",
            description: "plays audio from given yt url",
            type: ApplicationCommandType.ChatInput,
            options: [{
                name: "url",
                description: "plays audio from yt url",
                type: ApplicationCommandOptionType.String,
                required: false
            }]
        });
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.inCachedGuild()) throw new OnlyInGuild()

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) throw new MemberNotConnected()

        this.deferReply(interaction)

        const player = interaction.client.players.getOrCreate(interaction.guild.id);
        await player.tryJoin(voiceChannel)

        const url = interaction.options.getString("url");

        // resume
        if (!url) {
            player.resume()
            interaction.editReply("resumed!")
            return
        }

        // search and play
        const track = await ytdlp.getTrack(url)
        const inQueue = player.addTrack(track)

        if (inQueue) {
            interaction.editReply(`enqueued: ${track.title}`)
            return
        }

        interaction.editReply(`now playing: ${track.title}`)
    }
}