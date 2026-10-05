import { ytdlp, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { Logger } from "./Logger.js";
import { AlreadyPaused, AlreadyPlaying, NotPlaying, PublicError, VcJoinTimeOut } from "./PublicErrors.js";

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
    private song: {
        track: Track,
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
    #ready: Promise<void | PublicError>

    #logger?: Logger
    private get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: `GuildPlayerInstance: [${this.guildId}]`
        })
    }

    public static async asyncCreate(guildId: string, vc: VoiceBasedChannel) {
        const player = new this(guildId, vc)
        await player.ready()
        return player
    }

    public async ready() {
        const error = await this.#ready

        if (error) throw error
    }
    
    public constructor(guildId: string, vc: VoiceBasedChannel) {
        super()
        this.guildId = guildId
        this.audioPlayer = createAudioPlayer()

        // Join voice channel
        this.voice = {
            connection: joinVoiceChannel({
                channelId: vc.id,
                guildId: this.guildId,
                adapterCreator: vc.guild.voiceAdapterCreator,
            }),
            channelId: vc.id
        }

        this.#ready = entersState(this.voice.connection, VoiceConnectionStatus.Ready, 30_000)
            .then(() => {
                this.voice.connection.subscribe(this.audioPlayer)
            })
            .catch((error) => {
                this.logger.error(error)
                this.tryDisconnect()
                return new VcJoinTimeOut()
            })
    
        // register Player Events

        // emit errors
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

            if(!this.song) {
                this.emit("error", new Error("playing but no track is set in player"))
                return
            }

            this.emit("playingNewTrack", this.song.cause, this.song.track)
        })
    }

    public get track() {
        if (!this.song) return null
        return this.song.track
    }

    public getChannelId() {
        return this.voice.channelId
    }

    public setNewChannelId(newChannelId: string) {
        this.voice.channelId = newChannelId
        this.logger.log(`Bot was moved to new channel: [${newChannelId}]`)
    }

    public get state(): PlayerState {
        return {
            track: this.song?.track ?? null,
            queue: [...this.queue],
            status: this.status,
        }
    }

    public tryDisconnect() {
        if (this.voice.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.stop()
            this.voice.connection.destroy()
        }
        this.emit("disconnected")
    }

    // TODO maybe error handling with index out of range stuff
    // index 0 mean playing now, 1 first in queue
    public addTrack(track: Track): {inQueue: false} | {inQueue: true, index: number} {
        const index = this.queue.push(track)

        if (this.status === AudioPlayerStatus.Idle && !this.song) {
            // ! cause is "command"
            this.playNextTrack("command")
            return {inQueue: false}
        } else {
            return {inQueue: true, index}
        }
    }

    // index 0 mean playing now, 1 first in queue
    public insertTrack(track: Track, index: number | "now") {
        if (index === "now" || index === 0) {
            this.queue.splice(0, 0, track)
            this.playNextTrack("command")
            return
        }

        this.queue.splice(index - 1, 0, track)
    } 

    // -1 means not found
    public getTrackIndex(targetTrack: Track) {


        for (const [index, track] of [this.song?.track, ...this.queue].entries()) {
            if (track && targetTrack.uuid === track.uuid) {

                return index
            }
        }

        return -1
    }

    // index 0 mean playing now, 1 first in queue
    public deleteTrack(index: number) {
        this.queue.splice(index - 1, 1)
    }

    public skip() {
        // ! cause is "command"
        this.playNextTrack("command")
        if (!this.song) return null
        return this.song.track
    }

    public pause() {
        switch (this.status) {

            case AudioPlayerStatus.Paused: {
                throw new AlreadyPaused()
            }

            case AudioPlayerStatus.Playing: {
                this.audioPlayer.pause()
                if (!this.song) throw new Error("Playing without song")
                return this.song.track
            }

            default: {
                throw new NotPlaying()
            }
        }
    }

    public resume() {
        switch (this.status) {
            case AudioPlayerStatus.Buffering:
            case AudioPlayerStatus.Playing: {
                throw new AlreadyPlaying()
            }

            case AudioPlayerStatus.Paused: {
                this.audioPlayer.unpause()
                if (!this.song) throw new Error("Playing without song")
                return this.song.track
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
            this.song = null
            // stop playing remaining buffer
            this.audioPlayer.stop(true) 
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
                this.song = {
                    track: next,
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
        const stream = this.song?.stream
        this.song = null

        if (stream) {
            stream.kill("SIGKILL")
        }
    }
}