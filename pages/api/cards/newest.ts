import {parseNum, parseUrlParams, timePromise} from "../../../src/utils"
import {getAvailableCards} from "../../../src/server/boosterGeneration"
import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)

    Object.keys(params).forEach(k => params[k] = parseNum(params[k]) ?? params[k])

    const x = await timePromise<any[]>(getAvailableCards(params.skip, params.limit, undefined, params.sort))

    res.setHeader('Content-Type', 'application/json')
    res.status(200)
        .end(JSON.stringify(x.sort((a, b) => a.name.localeCompare(b.name))))
}
