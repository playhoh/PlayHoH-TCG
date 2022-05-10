import {debug, log} from "../../../src/utils"
import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/client/baseApi"

export async function getUserById(id) {
    try {
        moralisSetup(true, Moralis)
        const query = new Moralis.Query('User')
        query.equalTo('username', id)
        // debug("q users", query)
        const results = await query.find({useMasterKey: true});
        const res = JSON.parse(JSON.stringify(results))
        // debug("res users", res)
        return res.map(x => ({
            username: x.username,
            email: x.email,
            deck: x.deck,
            emailVerified: x.emailVerified,
            objectId: x.objectId
        }))
    } catch (e) {
        log("queryUsers " + e.message)
    } finally {
        moralisSetup(false, Moralis)
    }
}

export default async function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const arr = await getUserById(id)
    const ok = arr.length > 0
    const obj = ok ? {user: arr[0]} : {notFound: id}
    res.status(ok ? 200 : 404)

    res.json(obj)
}
