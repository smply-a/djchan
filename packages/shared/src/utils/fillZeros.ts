export function fillZeros(digits: number, n: number) {
    let str = ""
    for (let i = 0; i < digits; i++) {
        if (n < 10 ** i) {
            str += "0"
        }
    }

    return str + n
}