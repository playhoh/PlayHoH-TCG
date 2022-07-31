import {getImageForName} from "../wiki/[id]"

export default async (req, res) => {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const url = await getImageForName(id)
    if (!url)
        res.status(404).send(id)
    else
        res.redirect(url)
}
