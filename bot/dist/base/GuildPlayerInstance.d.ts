import { type Track } from "@app/player";
import { AudioPlayerStatus } from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
interface PlayerState {
    queue: Track[];
    track: Track | null;
    status: AudioPlayerStatus;
}
export type PlayerEventCause = "command" | "auto";
interface GuildPlayerEvents {
    queueEnd: [cause: PlayerEventCause];
    playingNewTrack: [cause: PlayerEventCause, track: Track];
    disconnected: [];
    error: [error: Error];
}
export declare class GuildPlayerInstance extends EventEmitter<GuildPlayerEvents> {
    #private;
    private song;
    private queue;
    readonly guildId: string;
    private audioPlayer;
    private voice;
    private get logger();
    static asyncCreate(guildId: string, vc: VoiceBasedChannel): Promise<GuildPlayerInstance>;
    ready(): Promise<void>;
    constructor(guildId: string, vc: VoiceBasedChannel);
    get track(): Track | null;
    getChannelId(): string;
    setNewChannelId(newChannelId: string): void;
    get state(): PlayerState;
    tryDisconnect(): void;
    addTrack(track: Track): boolean;
    insert(track: Track, index: number): void;
    skip(): Track | null;
    pause(): Track;
    resume(): Track;
    stop(): void;
    private get status();
    private playNextTrack;
    private tryKillStream;
}
export {};
