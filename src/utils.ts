export function fromBase64(b) {
    try {
        const buffer = new Buffer(b, 'base64')
        const res = buffer.toString()
        return res
    } catch (e) {
        throw new Error("cannot decode b64: '" + b + "': " + e)
    }
}

export function toBase64(s: ArrayBuffer | Buffer | string) {
    try {
        const buffer = Buffer.from(s)
        const res = buffer.toString('base64')
        return res
    } catch (e) {
        throw new Error("cannot encode string: '" + s + "': " + e)
    }
}

export function lerp(value1, value2, amount) {
    amount = amount < 0 ? 0 : amount
    amount = amount > 1 ? 1 : amount
    return value1 + (value2 - value1) * amount
}

export let now = () => new Date().toISOString().substring(0, 16).replace("T", " ") + "GMT"

export function cryptoRandomUUID() {
    return (new Date()).getTime().toString(36)
}

export const tempSeed = () => new Date().getTime().toString(36)

export function xmur3(str: string): () => number {
    let h
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
        h = h << 13 | h >>> 19
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507)
        h = Math.imul(h ^ (h >>> 13), 3266489909)
        return (h ^= h >>> 16) >>> 0
    }
}

export function toSet<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
}

export function shuffle<T>(array: T[], seed?: string) {
    const r = xmur3(seed || tempSeed())
    return array.sort(() => r() - r())
}

export let debugOn = process.env.NODE_ENV === "development"
export let isProduction = process.env.NODE_ENV === "production"

export function setDebugOn() {
    debugOn = true
}

export const BASE_URL = debugOn ? "http://localhost:3000" : "https://playhoh.com"

export function debug(...args: any[]) {
    if (debugOn && args)
        console.log(now(), ...args)
}

export function log(...args: any[]) {
    if (args)
        console.log(now(), ...args)
}

// https://stackoverflow.com/a/37511463
export function anglicize(str: string) {
    if (!str)
        return str

    const combining = /[\u0300-\u036F]/g

    str = str.replace("æ", "ae")
        .replace("Æ", "AE").replace("œ", "oe")
        .replace("Œ", "OE").replace("Ł", "L")

    return str.normalize('NFKD').replace(combining, '')
}

export function addTrackEntry(data: { user: string, event: string, session: string }) {
    const {user, event} = data ?? {}
    if (user && event) {
        fetch("/api/tracking", {method: "POST", body: JSON.stringify(data)})
    }
}

export function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number) {
    const element = arr[fromIndex]
    arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, element)
}

export function repeat<T>(times: number, value: T): T[] {
    return Array.from({length: times}).map(() => value)
}

export function capitalize(x: string): string {
    if (!x)
        return x
    return x.charAt(0).toUpperCase() + (x.length > 1 ? x.substring(1) : x)
}

export function parseNum(value) {
    try {
        const p = parseFloat(value)
        if (p >= 0)
            return p
    } catch {
    }
}

export function parseUrlParams(url?: string): any {
    const argsObj = {}
    url = url || (process.browser ? window.location.search : "")
    if (url)
        url.substring(1)
            .split("&").map(x => x.split("=").map(decodeURIComponent))
            .forEach(x => argsObj[x[0]] = x[1])
    return argsObj
}

export const empty = x => {
    const isEmpty = x === "" || x === null || x === undefined
    // console.log("empty?", x, " is ", isEmpty)
    return isEmpty
}

export function toBase64FromBuffer(buffer: ArrayBuffer | Buffer) {
    const base64String = toBase64(buffer)
    return "data:image/jpeg;base64," + base64String
}

export const cardBoxWidth = 180
export const cardBoxWidthMinusCost = 160

export const cardBoxFontSize = 12
export const cardBoxNameFontSize = 14
export const cardBoxFontSize2 = 9.2

export function getParam(key: string, query: string, mode?: string) {
    const idx = query.indexOf(key + "=")
    if (idx >= 0) {
        const after = query.substring(idx + key.length + 1)
        const part = after.split("&")[0]
        const asString = mode === "str"
        const res = asString ? part : parseFloat(part)
        return asString ? res : res < 0 || res > 3 ? 0 : res
        // TODO: think about it, maybe its ok to do this sanity check to save server caching
    }
    return 0
}

export async function time<T>(f): Promise<T> {
    return timePromise<T>(f())
}

export async function timePromise<T>(f: Promise<T>): Promise<T> {
    const start = new Date().getTime()
    const res = await f
    debug("cards/aggregate took", (new Date().getTime() - start) / 1000, "s")
    return res
}

// with font and image embedded with base64
export async function toBase64FromUrl(img: string, defaultImage) {
    let res: ArrayBuffer | Buffer = defaultImage
    try {
        res = await fetch(img).then(x => x.arrayBuffer())
    } catch (e) {
        debug("Error fetching img " + img + ": " + e.toString())
    }
    return res ? toBase64FromBuffer(res) : undefined
}

export function shortenWithLength(str: string) {
    return !str ? "" : str.substring(0, Math.max(70, str.length)) + "... (chars: " + str.length
}

export const base64OfHtml = ";base64,PCFET0NUW"