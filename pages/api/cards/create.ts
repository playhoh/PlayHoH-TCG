import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {postWithUserFromSession} from "../vote"
import {checkAndBuildObj} from "../trigger/[id]"
import {analyze, saveObj} from "../../../src/server/dbpedia"
import {log} from "../../../src/utils"
import {svgMap} from "../img/[id]"

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    await postWithUserFromSession(req, async (code, invalid) => {
            res.status(code).json(invalid)
        }, async (user, body, userObj, isAdmin) => {
            // debug("user", user)
            if (!isAdmin) {
                res.status(400).json({error: "error, not an admin", user})
            } else if (!body || !body.name) {
                res.status(400).json({error: "error with body, no name given"})
            } else {
                const item = body.name
                svgMap[item] = undefined
                try {
                    const x = await analyze(item.replace(/ /g, "_"))
                    if (body.fix) {
                        Object.keys(body.fix).forEach(key => x[key] = body.fix[key])
                    }
                    let err = ""
                    const notSavedInfo = (_, e) => err = e
                    const card = await checkAndBuildObj(x, notSavedInfo, item, body?.fix?.skipImg)
                    if (!card) {
                        res.status(400).json({error: "error saving card: " + err, item, card: x})
                    } else {
                        const savedInDb = await saveObj(card)
                        const url = "https://playhoh.com/c/" + card.key?.replace(/#/, "")
                        res.status(200).json({success: "saved " + item + " in db", url, card, savedInDb})
                    }
                } catch (e) {
                    let error = "error with card " + e
                    log("error on cards/create", error)
                    res.status(400).json({error, stack: e.stack})
                }
            }
        }
    )
}
