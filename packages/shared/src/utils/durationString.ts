export function getDurationString(duration: number) {
    const h = Math.floor(duration / (60*60))
    const mins = Math.floor(duration / 60)
    const seconds = duration % 60

    return h > 0 ? `${h}:${mins}:${seconds}` : `${mins}:${seconds}`
}