import {parseUrlParams} from "../../../src/utils"
import {ApiServer} from "../../../src/server/ApiServer"

export default async (req, res) => {
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)

    try {
        const offsetLimit = [
            params.offset !== undefined && `offset ${parseInt(params.offset)}`,
            params.limit !== undefined && `limit ${parseInt(params.limit)}`
        ].join(" ")

        const x = await ApiServer.runStatement(`
select * from hoh_cards ${offsetLimit}
`.trim())
        let returnVal = x.map(x => {
            let type = x.typeLine.split(" - ")[0]
            return ({
                ...x,
                cost: parseInt(x.cost),
                type,
                power: type === "Person" ? x.power || "0" : x.power,
                wits: type === "Person" ? x.wits || "0" : x.wits
            })
        })
        res
            .status(200)
            .send(returnVal)
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
