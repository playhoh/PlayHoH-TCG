import {moralisSetup} from "../../../src/baseApi"
import {debug, parseUrlParams} from "../../../src/utils"
import Moralis from "moralis/node"
import {Card} from "../../../interfaces/cardTypes"

export async function findSomeCard(queryFun, full?: boolean): Promise<Card[]> {
    const query = new Moralis.Query("Card")
    queryFun && queryFun(query)
    //query.exists("key")
    const arr = []
    let res = await query.find({useMasterKey: true})
    //let n = 0
    //while (res.length > 0) {

    //
    const items = full ?
        res.map(x => JSON.parse(JSON.stringify(x)))
        : res.map(x =>
            ({key: x.get('key'), name: x.get('name'), typeLine: x.get('typeLine')})
        )

    arr.push(...items)
    //  n += 100
    //debug("running cards/all, skipped: " + n)
    //query.skip(n)
    //res = await query.find({useMasterKey: true})
    //}
    debug("running cards/all, found: " + arr.length)
    return arr
}

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)

    debug("called cards/all, paginating with ", params)
    const skip = params.skip ? parseInt(params.skip) : 0
    try {
        const x = await findSomeCard(x => x.skip(isNaN(skip) ? 0 : skip).limit(100), false)
        res.status(200).json(x)
    } catch (x) {
        res.status(400).json({error: x.toString()})
    }
}
