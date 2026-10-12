export * from "./ytApi.js"

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