import {escapeSql, getPlayers} from "../../../src/utils"
import {ApiServer} from "../../../src/server/ApiServer"

export default async (req, res) => {
    try {
        const {player1, player2, state} = JSON.parse(req.body)

        if (!player1 || !player2) {
            throw new Error("needed {player1, player2}, found " + JSON.stringify({player1, player2}))
        }

        const {a, b} = getPlayers(player1, player2)

        if (req.method === "POST") {
            const js = JSON.parse(state)
            await ApiServer.runStatement(`
update hoh_game set timestamp=now(), state='${JSON.stringify(js)}'
where player1="${escapeSql(a)}" and player2="${escapeSql(b)}"
`.trim())
            res
                .status(200)
                .send({updated: true})
        } else {
            const x = await ApiServer.runStatement(`
select * from hoh_game where player1="${escapeSql(a)}" and player2="${escapeSql(b)}"
`.trim())
            let obj = x[0]
            if (obj) {
                throw new Error("game not found for player1, player2 = " + player1 + ", " + player2)
            }
            res
                .status(200)
                .send(obj)
        }
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
