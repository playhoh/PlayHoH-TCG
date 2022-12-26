import {debug, escapeSql, getPlayers, parseUrlParams} from "../../../src/utils"
import {ApiServer} from "../../../src/server/ApiServer"

export default async (req, res) => {
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)

    try {
        const {player1, player2, state, op} = JSON.parse(req.body)

        if (!player1 || !player2) {
            throw new Error("needed {player1, player2}, found " + JSON.stringify({player1, player2}))
        }

        const {a, b} = getPlayers(player1, player2)

        if (req.method === "PUT") {
            if (!state)
                throw new Error("not state in body given")


            const str = JSON.stringify(state).replace(/'/g, "&apos;")
            debug("JSON for put game v2", str)

            await ApiServer.runStatement(`
replace into hoh_game (player1, player2, timestamp, state) values ("${escapeSql(a)}", "${escapeSql(b)}", now(), '${escapeSql(str)}')
`.trim(), params.debug)

            // throw new Error("needs state, a json value in body, got " + state)

            res.status(200).send({updated: true})

        } else if (req.method === "POST") {
            const x = await ApiServer.runStatement(
                op === "or"
                    ?
                    `
select * from hoh_game where player1="${escapeSql(a)}" or player2="${escapeSql(b)}"
`.trim()
                    : `
select * from hoh_game where player1="${escapeSql(a)}" and player2="${escapeSql(b)}"
`.trim(), params.debug)
            let obj = x[0]
            if (!obj) {
                throw new Error("game not found for player1, player2 = " + player1 + ", " + player2)
            }
            res
                .status(200)
                .send({...obj, timestamp: obj.timestamp && new Date(obj.timestamp).getTime()})
        } else {
            throw new Error("can only process POST (to search) or PUT (to update)")
        }
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
