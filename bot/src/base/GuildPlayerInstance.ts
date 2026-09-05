import { ytdlp, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { Logger } from "./Logger.js";

interface PlayerState {
    queue: Track[]
    track: Track | null,
    status: AudioPlayerStatus
}

export enum PublicPlayerErrors {
    Internal,
    QueueEmpty,
    NotConnected,
    AlreadyPaused,
    AlreadyPlaying,
    NothingToPause,
    NothingToResume
}

interface GuildPlayerEvents {
    queueEnd: []
    enqueued: [track: Track]
    buffering: [track: Track]
    startedPlaying: [track: Track]
    disconnected: []
    paused: []
    resumed: []
    stopped: []
    error: [error: PublicPlayerErrors]
}

export class GuildPlayerInstance extends EventEmitter<GuildPlayerEvents> {
    private track: Track | null = null
    private queue: Track[] = []

    public readonly guildId: string
    private audioPlayer: AudioPlayer

    private connection: VoiceConnection | null = null
    private ytdlp: ChildProcess | null = null

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
            this.emit("error", PublicPlayerErrors.Internal)
        })

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.track = null
            this.playNextTrack()
        })

        this.audioPlayer.on(AudioPlayerStatus.Paused, () => {
            this.emit("paused")
        })

        this.audioPlayer.on(AudioPlayerStatus.Buffering, () => {
            if (!this.track) {
                throw new Error("Buffering without track")
            }

            this.emit("buffering", this.track)
        })

        this.audioPlayer.on(AudioPlayerStatus.Playing, (oldState) => {
            if (oldState.status === AudioPlayerStatus.Paused) {
                this.emit("resumed")
                return
            }

            if(!this.track) {
                throw new Error("Playing without track")
            }

            this.emit("startedPlaying", this.track)
        })
    }

    public get state(): PlayerState {
        return {
            track: this.track,
            queue: this.queue,
            status: this.status,
        }
    }

    private get status() {
        return this.audioPlayer.state.status
    } 

    public async tryJoin(vc: VoiceBasedChannel) {
        // alread connected
        if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            return  
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
            this.logger.error(`Failed to join vc: ${error}`)
            this.emit("error", PublicPlayerErrors.Internal)
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
            this.emit("error", PublicPlayerErrors.NotConnected)
            return
        }

        this.queue.push(track)

        if (this.status !== AudioPlayerStatus.Idle) {
            this.emit("enqueued", track)
        } else {
            this.playNextTrack()
        }
    }

    public pause() {
        if (!this.connection) {
            this.emit("error", PublicPlayerErrors.NotConnected)
            return
        }

        switch (this.status) {

            case AudioPlayerStatus.Paused: {
                this.emit("error", PublicPlayerErrors.AlreadyPaused)
                return
            }

            case AudioPlayerStatus.Idle: {
                this.emit("error", PublicPlayerErrors.NothingToPause)
                return
            }
        }

        this.audioPlayer.pause()
    }

    public resume() {
        if (!this.connection) {
            this.emit("error", PublicPlayerErrors.NotConnected)
            return
        }

        switch (this.status) {

            case AudioPlayerStatus.Playing: {
                this.emit("error", PublicPlayerErrors.AlreadyPlaying)
                return
            }

            case AudioPlayerStatus.Idle: {
                this.emit("error", PublicPlayerErrors.NothingToResume)
                return
            }
        } 

        this.audioPlayer.unpause()
    }

    public stop() {
        this.killYtdlp()
        this.audioPlayer.stop(true);
        this.queue = [];
        this.track = null;
    }

    private playNextTrack() {
        this.killYtdlp()
        const next = this.queue.shift()

        if (!next) {
            this.emit("queueEnd")
            return 
        } 

        this.track = next

        try {
            this.ytdlp = ytdlp.getWebmOpusStream(next.url)

            this.ytdlp.stderr?.on("data", (data) => this.logger.log("yt-dlp:", data.toString()));
            this.ytdlp.on("error", (err) => {
                this.logger.error("yt-dlp error:", err);
                this.emit("error", PublicPlayerErrors.Internal)
                this.playNextTrack();
            });

            this.ytdlp.on("close", () => this.logger.log("closed yt-dlp stream process"))

            if (!this.ytdlp.stdout) {throw new Error("No ytdlp.stdout, unkown cause")}

            const resource = createAudioResource(this.ytdlp.stdout, {
                inputType: StreamType.WebmOpus,
            });
            
            this.audioPlayer.play(resource)

        } catch (error) {
            this.logger.error(error)
            this.emit("error", PublicPlayerErrors.Internal)
        }
    }

    private killYtdlp() {
        if (this.ytdlp) {
            this.ytdlp.kill("SIGKILL")
            this.ytdlp = null
        }
    }
}