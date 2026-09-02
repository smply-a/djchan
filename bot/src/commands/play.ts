import { createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { spawn } from "child_process";
import { ApplicationCommandType, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { Command } from "../base/Command.js";

export class Play extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "play",
            description: "plays audio from given yt url",
            type: ApplicationCommandType.ChatInput,
        });
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({
                content: "Guild not cached or command used in DMs.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const vc = interaction.member.voice.channel;

        if (!vc) {
            await interaction.reply({
                content: "You must be in a voice channel.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();

        const connection = joinVoiceChannel({
            channelId: vc.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        // Player Logging
        player.on("stateChange", (oldState, newState) => {
            console.log(`Audio player state: ${oldState.status} -> ${newState.status}`);
        });
        player.on("error", (error) => {
            console.error("Audio player error:", error);
        });

        const url = "https://www.youtube.com/watch?v=Z_BhMhZpAug";

        const ytdlp = spawn("docker", [
            "run",
            "--rm",
            "-i",
            "ytdlp-test",
            "--no-progress",
            "-q",
            "-x",
            "--audio-format", "opus",
            "-o", "-",
            url,
        ]);

        ytdlp.stderr.on("data", (data) => console.error("yt-dlp stderr:", data.toString()));
        ytdlp.on("error", (err) => console.error("ffmpeg process error:", err));

        const resource = createAudioResource(ytdlp.stdout, {
            inputType: StreamType.WebmOpus,
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

        player.play(resource);
        await interaction.editReply("Now playing audio!");
    }
}