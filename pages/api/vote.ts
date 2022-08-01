import Moralis from "moralis/node"
import {log} from "../../src/utils"
import {moralisSetup} from "../../src/baseApi"
import {NextApiRequest, NextApiResponse} from "next"

export async function postWithUserFromSession(
    req,
    invalid: (code: number, obj: any) => Promise<void>,
    withUser: (user: string, body: any, userObj?: any, isAdmin?: boolean) => Promise<void>) {

    if (req.method != "POST") {
        await invalid(400, {method: "method must be POST"})
    } else {
        try {
            await moralisSetup(true, Moralis)

            const query = new Moralis.Query("_Session")
            let body = JSON.parse(req.body)
            let sessionToken = body?.sessionToken

            if (!sessionToken) {
                await invalid(400, {sessionToken: "sessionToken was missing in body"})
            } else {
                query.include("user")
                query.equalTo("sessionToken", sessionToken)
                query.limit(1)
                const result = await query.find({useMasterKey: true})
                if (result.length > 0) {
                    let userObj = result[0]?.get('user')
                    let username = userObj?.get('username')
                    //debug("sessionToken of username", sessionToken, " is ", username)
                    const isAdmin = (userObj?.getACL()?.permissionsById || {})["role:admin"] !== undefined
                    await withUser(username, body, userObj, isAdmin)
                } else {
                    await invalid(401, {sessionToken: "no user for sessionToken found"})
                }
            }
        } catch (e) {
            log("route yielded error " + e.toString())
            await invalid(400, {error: e.toString()})
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await postWithUserFromSession(req, async (code, invalid) => {
        res.status(code).json(invalid)
    }, async (user, body) => {
        // debug("user", user)

        let bodyOk = typeof body?.name === "string" && typeof body?.delta === "number"
        if (!bodyOk) {
            res.status(400).json({
                name: "name must be a non-empty string, got " + body?.name,
                delta: "delta must be +1 or -1, got " + body?.delta
            })
        } else {
            const Vote = Moralis.Object.extend('Vote')
            const query = new Moralis.Query(Vote)
            query.equalTo("name", body.name)
            query.equalTo("username", user)
            query.limit(1)
            const result = await query.find({useMasterKey: true})
            if (result.length !== 0) {
                res.status(200).json({name: "already voted"})
            } else {
                let vote = new Vote()

                vote.set("name", body.name)
                vote.set("username", user)
                vote.set("delta", body.delta)
                try {
                    await vote.save()
                    res.status(200).json({success: "voted for " + body.name})
                } catch (e) {
                    log("error on vote.save", e)
                    res.status(400).json({error: "error saving vote " + e})
                }
            }
        }
    })
}
