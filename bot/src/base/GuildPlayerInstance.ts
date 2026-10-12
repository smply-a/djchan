import { ytApi, type Track } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus, type AudioPlayer } from "@discordjs/voice";
import { type ChildProcess } from "child_process";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { Logger } from "./Logger.js";
import { AlreadyPaused, AlreadyPlaying, NotPlaying, PublicError, VcJoinTimeOut } from "./PublicErrors.js";

export interface PlayerState {
    queue: readonly Track[]
    track: Track | null,
    status: AudioPlayerStatus
}

interface GuildPlayerEvents {
    queueEndAuto: []
    playingNewTrackAuto: [track: Track]
    disconnected: []

    error: [error: unknown]
}

export class GuildPlayerInstance extends EventEmitter<GuildPlayerEvents> {
    private song: {
        track: Track,
        stream: ChildProcess
    } | null = null
    private queue: Track[] = []

    public readonly guildId: string
    private audioPlayer: AudioPlayer

    private voice: {
        connection: VoiceConnection,
        channelId: string
    }

    // mutex
    #ready: Promise<void | PublicError>
    #mutex: Promise<void> | null = null

    #logger?: Logger
    private get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: `GuildPlayerInstance: [${this.guildId}]`
        })
    }

    public static async create(guildId: string, vc: VoiceBasedChannel) {
        const player = new this(guildId, vc)
        await player.ready()
        return player
    }

    public async ready() {
        const error = await this.#ready

        if (error) throw error
    }
    
    private constructor(guildId: string, vc: VoiceBasedChannel) {
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
        this.audioPlayer.on(AudioPlayerStatus.Idle, async (oldState) => {
            this.tryKillStream(this.song?.stream)

            if (this.queue.length > 0) {
                if (this.#mutex) {
                    return
                }   

                // auto playlist
                try {
                    await this.playNextTrack()
                    if(!this.song) {
                        this.emit("error", new Error("playing but no track is set in player"))
                        return
                    }
                    this.emit("playingNewTrackAuto", this.song.track)

                } catch(error) {
                    this.emit("error", error)
                }
                return
            }

            this.emit("queueEndAuto")
        })
    }

    public get channelId() {
        return this.voice.channelId
    }

    public set channelId(newChannelId: string) {
        this.voice.channelId = newChannelId
        this.logger.log(`Bot was moved to new channel: [${newChannelId}]`)
    }

    public async getState(): Promise<PlayerState> {
        await this.awaitMutex()
        return {
            track: this.song?.track ?? null,
            queue: [...this.queue], // return copy not reference
            status: this.status,
        }
    }

    public tryDisconnect() {
        if (this.voice.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.stop()
            this.voice.connection.destroy()
            this.emit("disconnected")
        }
    }

    public async search(query: string) {
        try {
            const result = await ytApi.getTrack(query)
            return result

        } catch (error) {
            throw new SearchError(query, this.queue[0])
        }
    }

    // TODO maybe error handling with index out of range stuff
    // index 0 mean playing now, 1 first in queue
    public async addTrack(track: Track): Promise<
        | {inQueue: false }
        | {inQueue: true; index: number }
    > {

        const index = this.queue.push(track);

        // mutex so that not multiple commands enter the play now state
        // play immideately if idle and empty
        if (this.status === AudioPlayerStatus.Idle && !this.song && !this.#mutex) {
            await this.playNextTrack();
            return {inQueue: false};
        }

        return {inQueue: true, index };
    }

    // index 0 mean playing now, 1 first in queue
    public async insertTrack(track: Track, index: number | "now") {
        if (index === "now" || index === 0) {
            this.queue.splice(0, 0, track)

            await this.playNextTrack()
            return
        }

        this.queue.splice(index - 1, 0, track)
    } 

    // index 0 mean playing now, 1 first in queue
    public deleteTrack(index: number) {
        if (index > 0) {
            this.queue.splice(index - 1, 1)
            return 
        }
        this.tryKillStream(this.song?.stream)
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

    public async skip(): Promise<Track | null> {
        await this.playNextTrack()
        return this.song?.track ?? null
    }

    public pause() {
        switch (this.status) {

            case AudioPlayerStatus.Paused: {
                throw new AlreadyPaused()
            }

            case AudioPlayerStatus.Playing: {
                this.audioPlayer.pause()
                if (!this.song) throw new Error("playing but no track is set in player")
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
                if (!this.song) throw new Error("playing but no track is set in player")
                return this.song.track
            }

            default: {
                throw new NotPlaying()
            }
        } 
    }

    public stop() {
        this.queue = [];
        this.tryKillStream(this.song?.stream)
    }



    private get status() {
        return this.audioPlayer.state.status
    } 

    private async playNextTrack() {
        const unlock = await this.getMutexLock()

        this.tryKillStream(this.song?.stream)

        // on fail the track stays in queue for the user to decide weather to retry or skip
        const track = this.queue.shift()

        // if no song, do nothing
        if (!track) {
            unlock()
            return 
        }

        let stream: ChildProcess | undefined = undefined

        try {
            stream = ytApi.getWebmOpusStream(track.url)

            stream.on("close", () => {
                this.logger.log("closed yt-dlp stream process")
            })

            // wait for data to arrive
            await new Promise<void>((resolve, reject) => {
                const cleanup = () => {
                    clearTimeout(timeout)
                    stream?.stdout?.removeListener("readable", onReadable)
                    stream?.removeListener("exit", onExit)
                    stream?.removeListener("error", onError)
                };

                const timeout = setTimeout(() => {
                    cleanup()
                    reject(new Error("yt-dlp stream timeout (15s)"))
                }, 15_000)

                const onReadable = () => {
                    cleanup()
                    resolve()
                };

                const onExit = (code: number | null) => {
                    cleanup()
                    reject(new Error(`yt-dlp process exited prematurely with code ${code}`));
                };

                const onError = (error: Error) => {
                    cleanup()
                    reject(error)
                };

                stream?.stdout?.once("readable", onReadable)
                stream?.once("exit", onExit)
                stream?.once("error", onError)
                //stream?.stderr?.on("error", onError)
            });


            if (!stream.stdout) throw new Error("No ytdlp.stdout, unkown cause")

            const resource = createAudioResource(stream.stdout, {
                inputType: StreamType.WebmOpus,
            });
            
            // success
            this.song = {
                track,
                stream
            }
            this.audioPlayer.play(resource)

        // error
        } catch (error) {
            this.tryKillStream(stream)
            this.logger.error(error)
            throw new TrackError(track, this.queue[0])
        
        } finally {
            unlock()
        } 
    }

    private tryKillStream(stream?: ChildProcess): void {
        stream?.kill("SIGKILL");
        this.song = null;

        this.audioPlayer.stop(true);
    }

    private async awaitMutex() {
        while (this.#mutex) {
            await this.#mutex
        }
    }

    private async getMutexLock(): Promise<() => void> {
        const previous = this.#mutex;

        let releaseLock!: () => void;

        const current = new Promise<void>((resolve) => {
            releaseLock = resolve;
        });

        // lock before awaiting the previous operation.
        this.#mutex = current;

        if (previous) {
            await previous;
        }

        return () => {
            releaseLock();

            // dont clear lock that belongs to a newer operation
            if (this.#mutex === current) {
                this.#mutex = null;
            }
        };
    }
}



abstract class PlayerError extends Error {
    public nextTrack: Track | null;
    
    constructor(message: string, nextTrack?: Track | null) {
        super(message);
        this.nextTrack = nextTrack ?? null;
    }
}

export class TrackError extends PlayerError {
    constructor(public track: Track, nextTrack?: Track | null) {
        super(`Failed to play track: ${track.title}`, nextTrack);
    }
}

export class SearchError extends PlayerError {
    constructor(public query: string, nextTrack?: Track | null) {
        super(`Failed to find a track for query: ${query}`, nextTrack);
    }
}