import {cryptoRandomUUID, escapeSql} from "../../../src/utils"
import {ApiServer} from "../../../src/server/ApiServer"
import {hash} from "../../../test/dbTest.test"

export default async (req, res) => {
    try {
        const {email, password} = JSON.parse(req.body)

        if (!email || !password) {
            throw new Error("needed {email, password}, found " + JSON.stringify({email, password}))
        }

        const pwHash = hash(password)

        const x = await ApiServer.runStatement(`
select * from hoh_users where email="${escapeSql(email)}"
`.trim())
        if (x.length > 0) {
            const user = x.find(u => u.password === pwHash)
            if (user)
                res
                    .status(200)
                    .send({...user, username: email, password: undefined})
            else
                throw new Error("invalid password")
        } else {

            let first = x[0]
            if (!first) {
                const token = hash("/hoh-user/" + email + "/" + cryptoRandomUUID())
                const resSql = await ApiServer.runStatement(`
insert into hoh_users (email, password, token) values ("${escapeSql(email)}", "${escapeSql(pwHash)}", "${escapeSql(token)}")
`.trim())
                first = {email, token, data: '{}'}
            }
            res
                .status(200)
                .send({...first, username: email, password: undefined})
        }
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
