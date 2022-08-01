import {log} from "../../../src/utils"
import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/baseApi"
import {NextApiRequest, NextApiResponse} from "next"

export async function getUserById(id) {
    try {
        moralisSetup(true, Moralis)
        const query = new Moralis.Query('User')
        query.equalTo('username', id)
        // debug("q users", query)
        const results = await query.find({useMasterKey: true})
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const arr = await getUserById(id)
    const ok = arr.length > 0
    let arrElement = arr[0]
    delete arrElement.email
    const obj = ok ? {user: arrElement} : {notFound: id}
    res.status(ok ? 200 : 404)

    res.json(obj)
}
