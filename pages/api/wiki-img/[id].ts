import {getImageForName} from "../wiki/[id]"
import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const url = await getImageForName(id)
    if (!url)
        res.status(404).send(id)
    else
        res.redirect(url)
}
