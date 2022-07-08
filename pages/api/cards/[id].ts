import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {findSomeCard} from "./all"

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1)).toUpperCase()

    // debug("called cards/[id] with ", id)
    try {
        const x = await findSomeCard(x => x.limit(1).equalTo('key', "#" + id), false)
        res.status(200).json((x && x[0]) ?? {notFound: id})
    } catch (x) {
        res.status(400).json({error: x.toString()})
    }
}
