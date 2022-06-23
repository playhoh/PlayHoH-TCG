import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/client/baseApi"
import {getCardForId} from "../../../src/server/cardLookup"

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    moralisSetup(true, Moralis)
    const res1 = await getCardForId(id)

    if (res1) {
        res.status(200).json(res1)
    } else {
        res.status(404).json({notFound: id})
    }
}
