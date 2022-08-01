import {fetchSingleCat} from "../../../src/server/fetchWikiApi"
import {debug} from "../../../src/utils"
import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const arr = []
    const d = id

    const whenDone = () => {
        debug("done decade <" + d + ">", arr)
        res.status(200).json(arr)
    }
    const whenError = (error) => {
        debug("error with decade <" + d + ">", arr)
        res.status(200).json([])
    }
    const withCat = name => {
        debug("cat for decade <" + d + ">", name)
        arr.push({category: true, name})
    }
    const withItem = name => {
        debug("item for decade <" + d + ">", name)
        arr.push({category: false, name})
    }
    debug("researching decade <" + d + ">")
    await fetchSingleCat(d, withCat, withItem, whenDone, whenError)
}
