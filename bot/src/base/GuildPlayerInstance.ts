import { ytdlp, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { AlreadyConnected, AlreadyPaused, AlreadyPlaying, CLientNotConnected, NotPlaying, TimeOut } from "../types/PublicErrors.js";
import { Logger } from "./Logger.js";

interface PlayerState {
    queue: Track[]
    track: Track | null,
    status: AudioPlayerStatus
}

interface GuildPlayerEvents {
    queueEnd: []
    buffering: [track: Track]
    startedPlaying: [track: Track]
    paused: []
    resumed: []
    disconnected: []
    error: [error: Error]
}

export class GuildPlayerInstance extends EventEmitter<GuildPlayerEvents> {
    private track: Track | null = null
    private queue: Track[] = []

    public readonly guildId: string
    private audioPlayer: AudioPlayer

    private connection: VoiceConnection | null = null
    private ytdlp: ChildProcess | null = null

    private manualStop: boolean = false

    #logger?: Logger
    private get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: `GuildPlayerInstance: [${this.guildId}]`
        })
    }
    
    // TODO load from remoteplayer
    constructor(guildId: string) {
        super()
        this.guildId = guildId
        this.audioPlayer = createAudioPlayer()

        this.audioPlayer.on("error", (error) => {
            this.logger.error(error)
            this.emit("error", error)
        })

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.track = null
            if (this.manualStop) {
                this.manualStop = false
                return
            }
            this.playNextTrack()
        })

        this.audioPlayer.on(AudioPlayerStatus.Paused, () => {
            this.emit("paused")
        })

        this.audioPlayer.on(AudioPlayerStatus.Buffering, () => {
            if (!this.track) {
                this.emit("error", new Error("buffering without track"))
                this.logger.error("buffering without track")
                return
            }

            this.emit("buffering", this.track)
        })

        this.audioPlayer.on(AudioPlayerStatus.Playing, (oldState) => {
            if (oldState.status === AudioPlayerStatus.Paused) {
                this.emit("resumed")
                return
            }

            if(!this.track) {
                this.emit("error", new Error("playing without track"))
                this.logger.error("playing without track")
                return
            }

            this.emit("startedPlaying", this.track)
        })
    }

    public get state(): PlayerState {
        return {
            track: this.track,
            queue: [...this.queue],
            status: this.status,
        }
    }

    private get status() {
        return this.audioPlayer.state.status
    } 

    public async tryJoin(vc: VoiceBasedChannel) {
        // already connected
        if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            const currentChannelId = this.connection.joinConfig.channelId;
            if(vc.id === currentChannelId) {
                return
            }

            const channelName = currentChannelId ? vc.guild.channels.cache.get(currentChannelId)?.name : "unknown"
            throw new AlreadyConnected({
                channelName
            })
        }

        // else
        this.connection = joinVoiceChannel({
            channelId: vc.id,
            guildId: this.guildId,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        try {
            await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000)
            this.connection.subscribe(this.audioPlayer)
        } catch (error) {
            this.disconnect()
            throw new TimeOut()
        }
        
    }

    public disconnect() {
        this.stop()
        if (this.connection) {
            this.connection.destroy()
            this.connection = null
        }
        this.emit("disconnected")
    }

    public addTrack(track: Track) {
        if (!this.connection) {
            throw new CLientNotConnected()
        }

        this.queue.push(track)

        if (this.status !== AudioPlayerStatus.Idle) {
            return true
        } else {
            this.playNextTrack()
            return false
        }
    }

    public pause() {
        if (!this.connection) {
            throw new CLientNotConnected()
        }

        switch (this.status) {

            case AudioPlayerStatus.Paused: {
                throw new AlreadyPaused()
            }

            case AudioPlayerStatus.Idle: {
                throw new NotPlaying()
            }
        }

        this.audioPlayer.pause()
    }

    public resume() {
        if (!this.connection) {
            throw new CLientNotConnected()
        }

        switch (this.status) {

            case AudioPlayerStatus.Playing: {
                throw new AlreadyPlaying()
            }

            case AudioPlayerStatus.Idle: {
                throw new NotPlaying()
            }
        } 

        this.audioPlayer.unpause()
    }

    public stop() {
        this.manualStop = true
        this.killYtdlp()
        this.audioPlayer.stop(true);
        this.queue = [];
        this.track = null;
    }

    private playNextTrack() {
        this.killYtdlp()
        const next = this.queue.shift()

        if (!next) {
            this.track = null
            this.stop()
            this.emit("queueEnd")
            return
        } 

        this.track = next

        try {
            this.ytdlp = ytdlp.getWebmOpusStream(next.url)

            this.ytdlp.stderr?.on("data", (data) => this.logger.log("yt-dlp:", data.toString()));
            this.ytdlp.on("error", (err) => {
                this.logger.error("yt-dlp error:", err);
                this.emit("error", err)
                this.playNextTrack();
            });

            this.ytdlp.on("close", () => this.logger.log("closed yt-dlp stream process"))

            if (!this.ytdlp.stdout) throw new Error("No ytdlp.stdout, unkown cause")

            const resource = createAudioResource(this.ytdlp.stdout, {
                inputType: StreamType.WebmOpus,
            });
            
            this.audioPlayer.play(resource)

        } catch (error) {
            this.logger.error(error)
            this.emit("error", error as Error)
        }
    }

    private killYtdlp() {
        if (this.ytdlp) {
            this.ytdlp.kill("SIGKILL")
            this.ytdlp = null
        }
    }
}