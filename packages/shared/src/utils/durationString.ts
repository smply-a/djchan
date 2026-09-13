import { fillZeros } from "./fillZeros.js"

export function getDurationString(duration: number) {
    const h = Math.floor(duration / (60*60))
    const mins = Math.floor(duration / 60) % 60
    const seconds = duration % 60

    const secondsStr = `${fillZeros(2,seconds)}`
    const minsStr =  h > 0 ? `${fillZeros(2,mins)}` : `${mins}`

    return h > 0 ? `${h}:${minsStr}:${secondsStr}` : `${minsStr}:${secondsStr}`
}