import Moralis from "moralis/node"

export function testMode() {
    try {
        global.jest?.setTimeout && global.jest.setTimeout(100_000_000_000)
        jest.setTimeout(1_000_000_000)
    } catch (e) {
    }

    if (!process.env.NEXT_PUBLIC_MORALIS_APP_ID) {
        try {
            const fs = require("fs")
            const path = require("path")
            if (fs) {
                let items = 0
                let path1 = path.resolve(".env.test")
                //console.log("path1", path1)
                let s = fs.readFileSync(path1, 'utf-8')
                //console.log("s", s)
                s.split("\n").filter(x => x).forEach(line => {
                    const idx = line.indexOf("=")
                    if (idx >= 0) {
                        const key = line.substring(0, idx)
                        const value = line.substring(idx + 1).replace(/"/g, "")
                        process.env[key] = value
                        items++
                    }
                })
                console.log("set " + items + " env vars from " + path1)
            }
        } catch (e) {
            console.log("error loading env", e.toString())
        }
    }

    Moralis.serverURL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
    Moralis.initialize(
        process.env.NEXT_PUBLIC_MORALIS_APP_ID,
        process.env.MORALIS_WEB3V2_KEY,
        process.env.MORALIS_MASTER_KEY
    )
    if (!process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)
        throw new Error("not set: " + process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

    if (!global.fetch)
        global.fetch = require("isomorphic-fetch")
}
