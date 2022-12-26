import {moralisSetup} from "../../../src/baseApi"
import {postWithUserFromSession} from "../vote"
import {checkAndBuildObj} from "../trigger/[id]"
import {analyze, saveObj} from "../../../src/server/dbpedia"
import {log} from "../../../src/utils"
import {svgMap} from "../img/[id]"
import {NextApiRequest, NextApiResponse} from "next"
import {createdItems} from "../dbpedia/[id]"
import {baseUrl} from "../../../components/constants"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    moralisSetup(true)
    await postWithUserFromSession(req, async (code, invalid) => {
            res.status(code).json(invalid)
        }, async (user, body, userObj, isAdmin) => {
            // debug("user", user)
            if (!isAdmin) {
                res.status(200).json({error: "error, not an admin", user})
            } else if (!body || !body.name) {
                res.status(200).json({error: "error with body, no name given"})
            } else {
                const item = body.name

                svgMap[item] = undefined
                createdItems[item] = true

                try {
                    const x = await analyze(item.replace(/ /g, "_"))
                    if (body.fix) {
                        Object.keys(body.fix).forEach(key => x[key] = body.fix[key])
                    }
                    let err = ""
                    const notSavedInfo = (_, e) => err = e
                    const card = await checkAndBuildObj(x, notSavedInfo, item, body?.fix?.skipImg)
                    if (!card) {
                        res.status(200).json({error: "error saving card: " + err, item, card: x})
                    } else {
                        const savedInDb = await saveObj(card)
                        const url = baseUrl + "/c/" + card.hash
                        res.status(200).json({
                            success: "saved " + item + " in db", url, card,
                            savedInDb,
                            imgUrl: x.img
                        })
                    }
                } catch (e) {
                    let error = "error with card " + e
                    log("error on cards/create", error)
                    res.status(200).json({error, stack: e.stack})
                }
            }
        }
    )
}
