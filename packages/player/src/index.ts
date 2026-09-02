import { ytdlp } from "./ytdlp.js"

export { ytdlp }

export enum PlaybackStatus {
  Idle = "IDLE",
  Buffering = "BUFFERING",
  Playing = "PLAYING",
  Paused = "PAUSED",
}

export interface Track {
        title: string,
        interpret: string,
        url: string,

        duration: number,
        progress: number,

        addedByUserId: string
    }

export interface PlayerState {
    queue: Track[]
    track: Track | null,
    status: PlaybackStatus
}

export class PlayerManager {

}