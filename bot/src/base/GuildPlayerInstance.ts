import { ytdlp, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { AlreadyConnected, AlreadyPaused, AlreadyPlaying, CLientNotConnected, NotPlaying, VcJoinTimeOut } from "../types/PublicErrors.js";
import { Logger } from "./Logger.js";

interface PlayerState {
    queue: Track[]
    track: Track | null,
    status: AudioPlayerStatus
}

export type PlayerEventCause = "command" | "auto"

interface GuildPlayerEvents {
    queueEnd: [cause: PlayerEventCause]
    playingNewTrack: [cause: PlayerEventCause, track: Track]
    disconnected: []

    error: [error: Error]
}

export class GuildPlayerInstance extends EventEmitter<GuildPlayerEvents> {
    private track: {
        data: Track,
        stream: ChildProcess,
        cause: PlayerEventCause
    } | null = null
    private queue: Track[] = []

    public readonly guildId: string
    private audioPlayer: AudioPlayer

    private connection: VoiceConnection | null = null
    private channelId: string | null = null

    #logger?: Logger
    private get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: `GuildPlayerInstance: [${this.guildId}]`
        })
    }
    
    constructor(guildId: string) {
        super()
        this.guildId = guildId
        this.audioPlayer = createAudioPlayer()

        this.audioPlayer.on("error", (error) => {
            this.emit("error", error)
        })

        // Idle
        this.audioPlayer.on(AudioPlayerStatus.Idle, (oldState) => {
            this.tryKillStream()

            if (this.queue.length > 0) {
                // auto playlist
                this.playNextTrack("auto")
            }
        })

        // Playing
        this.audioPlayer.on(AudioPlayerStatus.Playing, (oldState) => {
            if (oldState.status === AudioPlayerStatus.Paused) {
                return
            }

            if(!this.track) {
                this.emit("error", new Error("playing but no track is set in player"))
                return
            }

            this.emit("playingNewTrack", this.track.cause, this.track.data)
        })
    }

    public get state(): PlayerState {
        return {
            track: this.track?.data ?? null,
            queue: [...this.queue],
            status: this.status,
        }
    }

    private get status() {
        return this.audioPlayer.state.status
    } 

    public async tryJoin(vc: VoiceBasedChannel) {
        // already connected to same channel: ignore
        if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            if(vc.id === this.channelId) {
                return
            }

            const channelName = this.channelId ? vc.guild.channels.cache.get(this.channelId)?.name : "unknown"
            throw new AlreadyConnected({
                channelName
            })
        }

        // else
        this.channelId = vc.id
        this.connection = joinVoiceChannel({
            channelId: this.channelId,
            guildId: this.guildId,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        try {
            await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000)
            this.connection.subscribe(this.audioPlayer)
        } catch (error) {
            this.tryDisconnect()
            throw new VcJoinTimeOut()
        }
        
    }

    public tryDisconnect() {
        this.stop()
        if (this.connection) {
            this.connection.destroy()
            this.connection = null
            this.channelId = null
            this.emit("disconnected")
        }
    }

    // ! cause is "command"
    public addTrack(track: Track) {
        if (!this.connection) {
            throw new CLientNotConnected()
        }

        this.queue.push(track)

        if (this.status === AudioPlayerStatus.Idle && !this.track) {
            this.playNextTrack("command")
            return false
        } else {
            return true
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
        this.queue = [];
        this.audioPlayer.stop(true);
        this.tryKillStream()
    }

    public updateChannelId(newChannelId: string) {
        this.channelId = newChannelId
        this.logger.log(`Bot was moved to new channel: [${newChannelId}]`)
    }

    private playNextTrack(cause: PlayerEventCause) {
        this.tryKillStream()
        const next = this.queue.shift()

        if (!next) {
            this.track = null
            this.emit("queueEnd", cause)
            return
        }

        try {
            const stream = ytdlp.getWebmOpusStream(next.url)

            stream.stderr?.on("data", (data) => this.logger.log("yt-dlp:", data.toString()));
            
            stream.on("error", (err) => {
                this.emit("error", err)
            });

            stream.on("close", () => {
                this.logger.log("closed yt-dlp stream process")
            })

            // prevent Stream from leaking
            try {
                if (!stream.stdout) throw new Error("No ytdlp.stdout, unkown cause")

                const resource = createAudioResource(stream.stdout, {
                    inputType: StreamType.WebmOpus,
                });
                
                // success
                this.track = {
                    data: next,
                    stream,
                    cause
                }
                this.audioPlayer.play(resource)

            } catch (error) {
                stream.kill("SIGKILL")
                throw error
            }

        // error
        } catch (error) {
            this.emit("error", error as Error)
        }
    }

    private tryKillStream() {
        const stream = this.track?.stream
        this.track = null

        if (stream) {
            stream.kill("SIGKILL")
        }
    }
}