import {moralisSetup} from "../../../src/baseApi"
import {debug} from "../../../src/utils"
import Moralis from "moralis/node"
import {Card} from "../../../interfaces/cardTypes"

export async function findSomeCard(queryFun): Promise<Card[]> {
    const query = new Moralis.Query("Card")
    queryFun && queryFun(query)
    const res = await query.find({useMasterKey: true})
    return res.map(x => JSON.parse(JSON.stringify(x)))
}

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    debug("called cards/all")
    try {
        const x = await findSomeCard(x => x)
        res.status(200).json(x)
    } catch (x) {
        res.status(400).json({error: x.toString()})
    }
}
