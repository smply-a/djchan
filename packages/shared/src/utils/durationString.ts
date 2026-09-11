export function getDurationString(duration: number) {
    const h = Math.floor(duration / (60*60))
    const mins = Math.floor(duration / 60)
    const seconds = duration % 60

    const secondsStr = (seconds < 10 ? "0" : "") + `${seconds}`
    const minsStr = (mins < 10 && h > 0 ? "0" : "") + `${mins}`

    return h > 0 ? `${h}:${minsStr}:${secondsStr}` : `${minsStr}:${secondsStr}`
}