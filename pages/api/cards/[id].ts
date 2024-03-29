import {moralisSetup} from "../../../src/baseApi"
import {parseUrlParams} from "../../../src/utils"
import {findSomeCard} from "../../../src/server/cardLookup"
import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    moralisSetup(true)
    const id =
        decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
            .toUpperCase().split("?")[0]

    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)

    // debug("called cards/[id] with ", id)
    try {
        const x = await findSomeCard(x => x.limit(1).equalTo('hash', id), params.full)
        res.status(200).json((x && x[0]) ?? {notFound: id})
    } catch (x) {
        res.status(400).json({error: x.toString()})
    }
}
