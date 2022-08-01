import {NextApiRequest, NextApiResponse} from "next"
import {analyze, convertImgUrl} from "../../../src/server/dbpedia"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    // const params = parseUrlParams("?" + search)

    let idWithUnderscore = id.replace(/ /g, "_")
    let item = await analyze(idWithUnderscore)

    let convertedUrl = !item ? undefined : convertImgUrl(item.img)

    let routeResult = item ? {...item, convertedUrl} : {notFound: idWithUnderscore}
    // res.status(200).json(routeResult)
    res.status(200).end(JSON.stringify(routeResult, null, 2))
}
