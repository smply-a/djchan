import { ytApi } from "./ytdlp.js"

export { ytApi }

export interface Track {
    uuid: string,

    title: string,
    interpret: string,
    url: string,
    duration: number,
    thumbnail: string,
    uploader_url: string,
    view_count: number,
    album?: string
    }