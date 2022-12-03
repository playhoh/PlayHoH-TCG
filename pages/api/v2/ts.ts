import {escapeSql, getPlayers} from "../../../src/utils"
import {ApiServer} from "../../../src/server/ApiServer"

export default async (req, res) => {
    try {
        const {player1, player2} = JSON.parse(req.body)

        if (!player1 || !player2) {
            throw new Error("needed {player1, player2}, found " + JSON.stringify({player1, player2}))
        }

        const {a, b} = getPlayers(player1, player2)

        const x = await ApiServer.runStatement(`
select timestamp from hoh_game where player1="${escapeSql(a)}" and player2="${escapeSql(b)}"
`.trim())
        let newTimestamp = x[0]?.timestamp
        if (!newTimestamp) {
            throw new Error("timestamp not found for player1, player2 = " + player1 + ", " + player2)
        }
        let timestamp = new Date(newTimestamp).getTime()
        res
            .status(200)
            .send({timestamp})
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
