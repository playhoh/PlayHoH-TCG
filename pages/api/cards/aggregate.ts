import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {CardEntry, getAvailableCards, getAvailableCardsFull} from "../../../src/server/boosterGeneration"
import {debug, parseUrlParams, timePromise} from "../../../src/utils"

export async function getCardsForParams(params, skip: number, limit: number, res, noSort?: boolean) {
    const full = params.full !== undefined

    try {
        const x =
            await timePromise<CardEntry[]>((full ? getAvailableCardsFull(skip, limit) : getAvailableCards(skip, limit)))
        // res.status(200).json(x)

        let values = noSort ? x : x.sort((a, b) => a.name.localeCompare(b.name))
        res.status(200)
            .setHeader('Content-Type', 'application/json')
            .end(JSON.stringify(values))
    } catch (x) {
        res.status(400).json({error: x.toString()})
    }
}

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)
    debug("called cards/aggregate, paginating with ", params)
    const skip = params.skip ? parseInt(params.skip) : undefined
    const limit = params.limit ? parseInt(params.limit) : undefined
    await getCardsForParams(params, skip, limit, res)
}
