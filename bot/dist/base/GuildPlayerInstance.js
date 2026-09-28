import { ytdlp } from "@app/player";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import {} from "child_process";
import { EventEmitter } from "events";
import { AlreadyPaused, AlreadyPlaying, NotPlaying, PublicError, VcJoinTimeOut } from "../types/PublicErrors.js";
import { Logger } from "./Logger.js";
export class GuildPlayerInstance extends EventEmitter {
    song = null;
    queue = [];
    guildId;
    audioPlayer;
    voice;
    // mutex on join
    #ready;
    #logger;
    get logger() {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: `GuildPlayerInstance: [${this.guildId}]`
        });
    }
    static async asyncCreate(guildId, vc) {
        const player = new this(guildId, vc);
        await player.ready();
        return player;
    }
    async ready() {
        const error = await this.#ready;
        if (error)
            throw error;
    }
    constructor(guildId, vc) {
        super();
        this.guildId = guildId;
        this.audioPlayer = createAudioPlayer();
        // Join voice channel
        this.voice = {
            connection: joinVoiceChannel({
                channelId: vc.id,
                guildId: this.guildId,
                adapterCreator: vc.guild.voiceAdapterCreator,
            }),
            channelId: vc.id
        };
        this.#ready = entersState(this.voice.connection, VoiceConnectionStatus.Ready, 30_000)
            .then(() => {
            this.voice.connection.subscribe(this.audioPlayer);
        })
            .catch((error) => {
            this.logger.error(error);
            this.tryDisconnect();
            return new VcJoinTimeOut();
        });
        // register Player Events
        this.audioPlayer.on("error", (error) => {
            this.emit("error", error);
        });
        // Idle
        this.audioPlayer.on(AudioPlayerStatus.Idle, (oldState) => {
            this.tryKillStream();
            if (this.queue.length > 0) {
                // auto playlist
                this.playNextTrack("auto");
            }
        });
        // Playing
        this.audioPlayer.on(AudioPlayerStatus.Playing, (oldState) => {
            if (oldState.status === AudioPlayerStatus.Paused) {
                return;
            }
            if (!this.song) {
                this.emit("error", new Error("playing but no track is set in player"));
                return;
            }
            this.emit("playingNewTrack", this.song.cause, this.song.track);
        });
    }
    get track() {
        if (!this.song)
            return null;
        return this.song.track;
    }
    getChannelId() {
        return this.voice.channelId;
    }
    setNewChannelId(newChannelId) {
        this.voice.channelId = newChannelId;
        this.logger.log(`Bot was moved to new channel: [${newChannelId}]`);
    }
    get state() {
        return {
            track: this.song?.track ?? null,
            queue: [...this.queue],
            status: this.status,
        };
    }
    tryDisconnect() {
        if (this.voice.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.stop();
            this.voice.connection.destroy();
        }
        this.emit("disconnected");
    }
    addTrack(track) {
        this.queue.push(track);
        if (this.status === AudioPlayerStatus.Idle && !this.song) {
            // ! cause is "command"
            this.playNextTrack("command");
            return false;
        }
        else {
            return true;
        }
    }
    insert(track, index) {
        this.queue.splice(index, 0, track);
    }
    skip() {
        // ! cause is "command"
        this.playNextTrack("command");
        if (!this.song)
            return null;
        return this.song.track;
    }
    pause() {
        switch (this.status) {
            case AudioPlayerStatus.Paused: {
                throw new AlreadyPaused();
            }
            case AudioPlayerStatus.Playing: {
                this.audioPlayer.pause();
                if (!this.song)
                    throw new Error("Playing without song");
                return this.song.track;
            }
            default: {
                throw new NotPlaying();
            }
        }
    }
    resume() {
        switch (this.status) {
            case AudioPlayerStatus.Buffering:
            case AudioPlayerStatus.Playing: {
                throw new AlreadyPlaying();
            }
            case AudioPlayerStatus.Paused: {
                this.audioPlayer.unpause();
                if (!this.song)
                    throw new Error("Playing without song");
                return this.song.track;
            }
            default: {
                throw new NotPlaying();
            }
        }
    }
    stop() {
        this.queue = [];
        this.audioPlayer.stop(true);
        this.tryKillStream();
    }
    get status() {
        return this.audioPlayer.state.status;
    }
    playNextTrack(cause) {
        this.tryKillStream();
        const next = this.queue.shift();
        if (!next) {
            this.song = null;
            // stop playing remaining buffer
            this.audioPlayer.stop(true);
            this.emit("queueEnd", cause);
            return;
        }
        try {
            const stream = ytdlp.getWebmOpusStream(next.url);
            stream.stderr?.on("data", (data) => this.logger.log("yt-dlp:", data.toString()));
            stream.on("error", (err) => {
                this.emit("error", err);
            });
            stream.on("close", () => {
                this.logger.log("closed yt-dlp stream process");
            });
            // prevent Stream from leaking
            try {
                if (!stream.stdout)
                    throw new Error("No ytdlp.stdout, unkown cause");
                const resource = createAudioResource(stream.stdout, {
                    inputType: StreamType.WebmOpus,
                });
                // success
                this.song = {
                    track: next,
                    stream,
                    cause
                };
                this.audioPlayer.play(resource);
            }
            catch (error) {
                stream.kill("SIGKILL");
                throw error;
            }
            // error
        }
        catch (error) {
            this.emit("error", error);
        }
    }
    tryKillStream() {
        const stream = this.song?.stream;
        this.song = null;
        if (stream) {
            stream.kill("SIGKILL");
        }
    }
}
