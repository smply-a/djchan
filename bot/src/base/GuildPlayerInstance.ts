import { PlaybackStatus, ytdlp, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { Guild, VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { Logger } from "./Logger.js";

export enum GuildPlayerCodes {
    success,
    alreadyConnected,
    queueEmpty,
    notConnected
}

export class GuildPlayerInstance extends EventEmitter {
    private track: Track | null = null
    private queue: Track[] = []
    private status = PlaybackStatus.Idle

    public readonly guildId: string
    private connection: VoiceConnection | null = null

    private audioPlayer: AudioPlayer
    private ytdlp: ChildProcess | null = null

    #logger?: Logger
    private get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: `GuildPlayerInstance: [${this.guildId}]`
        })
    }
    
    // TODO load from remoteplayer
    constructor(guild: Guild) {
        super()
        this.guildId = guild.id
        this.audioPlayer = createAudioPlayer()

        this.audioPlayer.on("error", (error) => {
            this.logger.error(error)
        })

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.track = null
            this.playNextTrack()
        })
    }

    public get state() {
        return {
            track: this.track,
            queue: this.queue,
            status: this.status,
        }
    }

    public async join(vc: VoiceBasedChannel) {
        if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            return GuildPlayerCodes.alreadyConnected  
        }

        this.connection = joinVoiceChannel({
            channelId: vc.id,
            guildId: this.guildId,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000)
        this.connection.subscribe(this.audioPlayer)
        return GuildPlayerCodes.success
    }

    // TODO maybe rework when website dazu kommt
    public addTrack(track: Track) {
        if (!this.connection) {
            return GuildPlayerCodes.notConnected
        }
        this.queue.push(track)
        if ( this.status === PlaybackStatus.Idle) {
            this.playNextTrack()
        } else {
            this.updateState(this.status)
        }
        
    }

    public stop() {
        this.killYtdlp()
        this.audioPlayer.stop(true);
        this.queue = [];
        this.track = null;
        this.updateState(PlaybackStatus.Idle);
    }

    private playNextTrack() {
        this.killYtdlp()
        const next = this.queue.shift()

        if (!next) {
            this.updateState(PlaybackStatus.Idle)
            return GuildPlayerCodes.queueEmpty
        } 

        this.track = next
        this.updateState(PlaybackStatus.Buffering)

        try {
            this.ytdlp = ytdlp.getWebmOpusStream(next.url)

            this.ytdlp.stderr?.on("data", (data) => this.logger.error("yt-dlp:", data.toString()));
            this.ytdlp.on("error", (err) => this.logger.error("yt-dlp error:", err));
            this.ytdlp.on("close", () => this.logger.log("closed yt-dlp process"))

            if (!this.ytdlp.stdout) {throw new Error("No ytdlp.stdout, unkown cause")}

            const resource = createAudioResource(this.ytdlp.stdout, {
                inputType: StreamType.WebmOpus,
            });
            
            this.audioPlayer.play(resource)
            this.updateState(PlaybackStatus.Playing)

        } catch (error) {
            this.logger.error(error)
            this.playNextTrack()
        }
    }

    private updateState(newStatus: PlaybackStatus) {
        this.status = newStatus
        this.emit("status", this.state)
    }

    private killYtdlp() {
        if (this.ytdlp) {
            this.ytdlp.kill("SIGKILL")
            this.ytdlp = null
        }
    }
}