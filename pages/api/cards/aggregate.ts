import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {CardEntry, getAvailableCards, getAvailableCardsFull} from "../../../src/server/boosterGeneration"
import {debug, parseUrlParams} from "../../../src/utils"

export async function time<T>(f): Promise<T> {
    return timePromise<T>(f())
}

export async function timePromise<T>(f: Promise<T>): Promise<T> {
    const start = new Date().getTime()
    const res = await f
    debug("cards/aggregate took", (new Date().getTime() - start) / 1000, "s")
    return res
}

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)
    debug("called cards/aggregate, paginating with ", params)
    const skip = params.skip ? parseInt(params.skip) : undefined
    const limit = params.limit ? parseInt(params.limit) : undefined
    const full = params.full !== undefined

    try {

        const x =
            await timePromise<CardEntry[]>((full ? getAvailableCardsFull(skip, limit) : getAvailableCards(skip, limit)))
        // res.status(200).json(x)

        res.status(200)
            .setHeader('Content-Type', 'application/json')
            .end(JSON.stringify(x.sort((a, b) => a.name.localeCompare(b.name))))
    } catch (x) {
        res.status(400).json({error: x.toString()})
    }
}
