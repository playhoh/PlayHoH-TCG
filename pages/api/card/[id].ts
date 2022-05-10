import {getCardForId} from "../../../src/server/cardLookup"

export default async function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const card = await getCardForId(id)
    res.status(200).json(card)
}