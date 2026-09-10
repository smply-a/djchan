import { ytdlp } from "./ytdlp.js"

export { ytdlp }

export interface Track {
        title: string,
        interpret: string,
        url: string,
        duration: number,
        thumbnail: string,
        uploader_url: string,
    }