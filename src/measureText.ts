import {cardBoxFontSize, cardBoxWidth} from "./utils"

// https://stackoverflow.com/a/48172630
const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125,
    0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125,
    0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875,
    0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625,
    0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625,
    0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875,
    0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625,
    0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625
]
const avg = 0.5279276315789471

export function measureText(str: string, fontSize?: number) {
    return Array.from(str).reduce(
        (acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0
    ) * (fontSize || 12)
}


export function splitIntoBox(str, fontSize?: number, boxWidth?: number) {
    const res = []
    str?.split("\n").forEach(x =>
        res.push(...splitIntoBox0(x, fontSize, boxWidth))
    )
    return res
}

function splitIntoBox0(str, fontSize?: number, boxWidth?: number) {
    fontSize = fontSize || cardBoxFontSize
    boxWidth = boxWidth || cardBoxWidth
    const parts = str.replace(/\r/g, "").split(" ")
    let width = 0
    let buffer = ""
    let res = []
    let nextOnNewLine = ""
    for (let i = 0; i < parts.length; i++) {
        let word = parts[i] + " "
        let cur = measureText(word, fontSize)
        if (word.includes("\n")) {
            const idx = word.indexOf('\n')
            const part1 = word.substring(0, idx).trim()
            const part2 = word.substring(idx + 1).trim()
            // const before = [...parts]
            word = parts[i] = part1
            cur = measureText(word, fontSize)
            parts.splice(i + 1, 0, part2)
            nextOnNewLine = part2
        }

        if (width + cur >= boxWidth || nextOnNewLine === word.trim()) {
            nextOnNewLine = ""
            res.push({text: buffer.trim(), width})
            width = cur
            buffer = word
        } else {
            width += cur
            buffer += word
        }
    }

    if (width !== 0) {
        res.push({text: res.length === 0 ? str : buffer.trim(), width: boxWidth})
    }
    return res
}
