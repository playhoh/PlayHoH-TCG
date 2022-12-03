import {ApiServer} from "../../src/server/ApiServer"
import {parseUrlParams} from "../../src/utils"

export default async (req, res) => {
    try {
        const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
        const params = parseUrlParams("?" + search)

        const {secret, code} = JSON.parse(req.body)
        if (secret !== process.env.CONNECTION_SECRET) {
            throw new Error("invalid secret in body")
        }
        if (!code) {
            throw new Error("no code in body")
        }
        const res2 = await ApiServer.runStatement(code, params.debug)
        res
            .status(200)
            .send(res2)
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
