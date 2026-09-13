import { fillZeros } from "./fillZeros.js"

export function viewString(views: number) {
    const lower = views % 1000
    const middle = Math.floor((views % 1000_000) / 1000)
    const mio = Math.floor((views % 1_000_000_000) / 1_000_000)
    const mrd = Math.floor((views) / 1_000_000_000)

    console.log(middle, mio)

    if (views < 1_000) return `${lower}`
    if (views < 1_000_000) return `${middle}.${fillZeros(3,lower)}`
    if (views < 1_000_000_000) return `${mio}.${Math.floor(middle / 100)} mio`
    return `${mrd}.${Math.floor(mio / 100)} mrd`
}