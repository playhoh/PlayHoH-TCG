import {beta1Json, beta2Json} from "../../../src/server/personJson"
import {NextApiRequest, NextApiResponse} from "next"

export const allPredefinedDecks = {"beta1": beta1Json, "beta2": beta2Json}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const obj = {deck: allPredefinedDecks[id]}
    res.status(200).json(obj)
}
