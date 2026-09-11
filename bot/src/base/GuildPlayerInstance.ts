import { ytdlp, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { AlreadyPaused, AlreadyPlaying, CLientNotConnected, NotPlaying, VcJoinTimeOut } from "../types/PublicErrors.js";
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

    private voice: {
        connection: VoiceConnection,
        channelId: string
    }

    // mutex on join
    private joining: Promise<unknown> | null = null

    public getChannelId(): string | null {
        if (!this.voice) return null
        return this.voice.channelId
    }

    public setNewChannelId(newChannelId: string) {
        if (!this.voice) throw new Error ("cant update channel if not connected")
        this.voice.channelId = newChannelId
        this.logger.log(`Bot was moved to new channel: [${newChannelId}]`)
    }

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

    public async waitJoin() {
        if (this.joining) {
            await this.joining
        }
    }

    public async tryJoin(vc: VoiceBasedChannel) {
        try {
            // waits for "mutex"
            if (this.joining) {
                await this.joining
            }

            // check if bot already connected
            if (this.voice && this.voice.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                return
            }

            // bot not already connected
            this.voice = {
                connection: joinVoiceChannel({
                    channelId: vc.id,
                    guildId: this.guildId,
                    adapterCreator: vc.guild.voiceAdapterCreator,
                }),
                channelId: vc.id
            }

            // set mutex 
            // ? i believe this is a mutex because js only switches context after an await
            this.joining = entersState(this.voice.connection, VoiceConnectionStatus.Ready, 30_000)
            await this.joining
            this.voice.connection.subscribe(this.audioPlayer)

        } catch (error) {
            this.tryDisconnect()
            throw new VcJoinTimeOut()

        } finally {
            // reset mutex
            this.joining = null
        }
        
    }

    public tryDisconnect() {
        this.stop()
        if (this.voice) {
            this.voice.connection.destroy()
            this.voice = null
            this.emit("disconnected")
        }
    }

    // ! cause is "command"
    public addTrack(track: Track) {
        if (!this.voice) {
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

    public skip() {
        this.playNextTrack("command")
        if (!this.track) return null
        return this.track.data
    }

    public pause() {
        if (!this.voice) {
            throw new CLientNotConnected()
        }

        switch (this.status) {

            case AudioPlayerStatus.Paused: {
                throw new AlreadyPaused()
            }

            case AudioPlayerStatus.Playing: {
                this.audioPlayer.pause()
                break
            }

            default: {
                throw new NotPlaying()
            }
        }
    }

    public resume() {
        if (!this.voice) {
            throw new CLientNotConnected()
        }

        switch (this.status) {
            case AudioPlayerStatus.Buffering:
            case AudioPlayerStatus.Playing: {
                throw new AlreadyPlaying()
            }

            case AudioPlayerStatus.Paused: {
                this.audioPlayer.unpause()
                break
            }

            default: {
                throw new NotPlaying()
            }
        } 
    }

    public stop() {
        this.queue = [];
        this.audioPlayer.stop(true);
        this.tryKillStream()
    }



    private get status() {
        return this.audioPlayer.state.status
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