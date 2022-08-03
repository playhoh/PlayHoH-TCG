import {debug, parseUrlParams, toSet} from "../../../src/utils"
import {getItemsFromCat} from "../../../src/server/dbpedia"
import {NextApiRequest, NextApiResponse} from "next"
import {goodStartingPoints} from "../trigger/[id]"

export const createdItems = {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)
    if (id === "0") {
        res.status(200).json(goodStartingPoints)
    } else {
        let items = await getItemsFromCat(id)
        let newItems = toSet(!params.filter ? items : items.filter(x => !createdItems[x])).sort()
        // debug("category for", id, "with", params, "yielded", newItems)
        res.status(200).json(newItems)
    }
}
