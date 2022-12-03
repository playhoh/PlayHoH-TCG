import {escapeSql} from "../../../src/utils"
import {ApiServer} from "../../../src/server/ApiServer"
import {hash} from "../../../test/dbTest.test"

export default async (req, res) => {
    try {
        const {mail, password} = JSON.parse(req.body)

        if (!mail || !password) {
            throw new Error("needed {mail, password}, found " + JSON.stringify({mail, password}))
        }

        const pwHash = hash(password)

        const x = await ApiServer.runStatement(`
select timestamp from hoh_users where mail="${escapeSql(mail)}" and password="${escapeSql(pwHash)}"
`.trim())
        let first = x[0]
        if (!first) {
            throw new Error("not found")
        }
        res
            .status(200)
            .send(first)
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
