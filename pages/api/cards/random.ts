import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {debug, parseUrlParams} from "../../../src/utils"
import {randomGenTime} from "../../../src/polygen"
import {getCardsForParams} from "./aggregate"
import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    moralisSetup(true, Moralis)
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)
    debug("called cards/random, with ", params)
    let randomGenTime1 = randomGenTime()
    const skip = Math.abs(randomGenTime1() % 200)
    const limit = 40

    await getCardsForParams(params, skip, limit, res, true)
}
