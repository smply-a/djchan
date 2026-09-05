import { ytdlp } from "@app/player";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";

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
                required: true
            }]
        });
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.inCachedGuild()) {
            // todo public error class with hanlde for messages
            throw new Error("Not used in dms or cahced guild")
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            // todo public error class with hanlde for messages
            throw new Error("you must be in a vc")
        }

        const url = interaction.options.getString("url", true);
        const player = interaction.client.players.getOrCreate(interaction.guild.id);

        const track = await ytdlp.getTrack(url)

        player.tryJoin(voiceChannel)
        player.addTrack(track)
    }
}