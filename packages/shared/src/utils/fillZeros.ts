export function fillZeros(digits: number, n: number) {
    let str = ""
    for (let i = 0; i < digits; i++) {
        if (n < 10 ** i) {
            str += "0"
        }
    }

    // prevent 0 from beeing to much
    return str + (n > 0 ? n : "")
}