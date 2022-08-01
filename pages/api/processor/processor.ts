import fetch from "node-fetch"
import {postWithUserFromSession} from "../vote"
import {BASE_URL, now, shuffle, toSet} from "../../../src/utils"

export const processorStatusForId = {}

export default async function handler(req, res) {
    await postWithUserFromSession(req, async (code, invalid) => {
        res.status(code).json(invalid)
    }, async (username, body, userObj, isAdmin) => {
        if (!isAdmin) {
            res.status(400).json({error: "must be admin"})
        } else {
            let data = processorStatusForId[username]
            const firstStep = !data
            if (firstStep) {
                data = {
                    started: now(),
                    lastCall: now(),
                    lastAction: "firstListUrl",
                    done: false,
                    data: {},
                    list: []
                }
                processorStatusForId[username] = data
            }

            data.done = false
            data.lastCall = now()

            if (firstStep) {
                data.lastUrl = BASE_URL + "/api/dbpedia/0"
                data.list = await fetch(data.lastUrl).then(x => x.json())
            } else if (data.list.length > 0) {
                data.lastItem = data.list.pop()
                data.lastUrl = BASE_URL + "/api/dbpedia/" + data.lastItem
                data.list = shuffle(toSet(
                    [...(await fetch(data.lastUrl).then(x => x.json())), ...data.list]
                ))

                data.lastUrl = BASE_URL + "/api/cards/create"
                data.data = await fetch(data.lastUrl, {
                    method: "POST",
                    body: JSON.stringify({sessionToken: body.sessionToken, name: data.lastItem})
                }).then(x => x.json())
            }

            data.done = true
            const resultForRoute = {
                ...data,
                list: data.list.length > 10 ? "array with " + data.list.length + " items" : data.list
            }
            res.status(200).send(resultForRoute)
        }
    })
}
