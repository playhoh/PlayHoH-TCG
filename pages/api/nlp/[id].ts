import {findEntities} from "../../../src/nlpApi";

export default async (req, res) => {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const input = decodeURIComponent(id)
    const result = await findEntities(input)
    res.status(200).json({input, result})
}
