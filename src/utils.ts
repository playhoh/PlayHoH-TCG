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

export function xmur3(str: string): () => number {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
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

export let debugOn = process.env.NODE_ENV === "development"

export const BASE_URL = debugOn ? "http://localhost:3000" : "https://playhoh.com"

export function testMode() {
    debugOn = true
    if (!global.fetch)
        global.fetch = require("isomorphic-fetch")
}

export function debug(...args: any[]) {
    if (debugOn && args)
        console.log(now(), ...args)
}

export function log(...args: any[]) {
    if (args)
        console.log(now(), ...args)
}

export function anglicize(str: string) {
    if (!str)
        return str

    const combining = /[\u0300-\u036F]/g

    str = str.replace("æ", "ae")
        .replace("Æ", "AE").replace("œ", "oe")
        .replace("Œ", "OE").replace("Ł", "L")

    return str.normalize('NFKD').replace(combining, '')
}

export function addTrackEntry(data: { user: string, event: string }) {
    const {user, event} = data ?? {}
    if (user && event) {
        let sum = 0;
        (user + "|" + event).split("").forEach(x =>
            sum += x.charCodeAt(0)
        );
        (data as any).s = sum
        //try {
        fetch("/api/tracking/" + toBase64(JSON.stringify(data)))
        /*.then(x => {
            debug("log call ok: " + event + " for " + user)
        }).catch(e =>
            log("tracking failed " + e.toString())
        )*/
        //} catch (e) {
        //  log("tracking failed " + e.toString())
        //}
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

export function parseUrlParams(): any {
    const argsObj = {}
    if (process.browser)
        window.location.search
            .substring(1)
            .split("&").map(x => x.split("=").map(decodeURIComponent))
            .forEach(x => argsObj[x[0]] = x[1])
    return argsObj
}