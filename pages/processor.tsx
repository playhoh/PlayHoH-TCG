import React from 'react'
import {useUser} from "../src/client/userApi"
import {BASE_URL, parseUrlParams, repeat, shuffle, toSet} from "../src/utils"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Button} from "@mui/material"
import {LoginFirst} from "../components/LoginFirst"
import {Layout} from "../components/Layout"
import {gameName} from "../components/constants"
import {HohApiWrapper} from "../src/client/clientApi"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"

export function ProcessorLogic() {
    const {user, isAuthenticated} = useUser()
    const [res, setRes] = React.useState(undefined)
    const params = parseUrlParams()
    const waitTime = params.waitTime || 200
    const parallel = params.parallel || 1
    const startPoint = params.startPoint ?? 0
    const auto = params.auto

    async function start() {
        let res = undefined
        setRes(val => {
            res = val
            return val
        })

        let data: any = !res ? undefined : {...res, list: [...(res.list || [])]}
        const firstStep = !data
        if (firstStep) {
            data = {
                started: new Date(),
                lastCall: new Date(),
                lastAction: "firstListUrl",
                done: false,
                data: {},
                list: [],
                created: 0,
                processed: 0
            }
        }

        data.done = false
        data.lastCall = new Date()

        if (firstStep) {
            data.lastUrl = BASE_URL + "/api/dbpedia/" + startPoint
            data.list = await fetch(data.lastUrl).then(x => x.json())
        } else if (data.list.length > 0) {
            await Promise.all(repeat(parallel, "").map(async () => {
                data.lastItem = data.list.pop()

                if (data.list.length % 4 === 0) {
                    data.lastUrl = BASE_URL + "/api/dbpedia/" + data.lastItem
                    data.list = shuffle(toSet(
                        [...(await fetch(data.lastUrl).then(x => x.json())), ...data.list]
                    ))
                }

                data.lastUrl = BASE_URL + "/api/cards/create"
                data.data = await fetch(data.lastUrl, {
                    method: "POST",
                    body: JSON.stringify({sessionToken: user?.sessionToken, name: data.lastItem})
                }).then(x => x.json())

                data.created = data.data.error ? 0 : 1
                data.processed++
                const key = data.data.card?.key
                if (key)
                    data.lastCardUrl = imgUrlForName(key.replace("#", ""))
            }))
        }

        data.done = true
        setRes(data)

        if (auto)
            setTimeout(() => {
                start()
            }, waitTime)
    }

    return !isAuthenticated ? <LoginFirst/>
        : !user.isAdmin ? <AskAnAdmin/>
            : <div>
                <h1>{'Process cards'}</h1>
                <Button color="primary" disabled={!!res} fullWidth variant="outlined"
                        onClick={() => start()}>
                    {'Start ' + (!auto ? "one call" : "auto call")}
                </Button>
                <br/>
                <pre>
                    Params: {JSON.stringify(params)}
                </pre>
                {res && <>
                    <pre>
                        Status: {res.processed} processed, {res.created} created
                        <br/>
                        Time Running: {Math.floor((res.lastCall - res.started) / 1000)}s, started: {res.started?.toString()}
                        <br/>
                        Current: {res.lastItem}
                        <br/>
                        Items in pipeline: {res.list.length}
                    </pre>
                    {res.lastCardUrl && <img src={res.lastCardUrl} height="300"/>}
                    <pre>
                        {JSON.stringify({
                            ...res,
                            list: res.list.length > 10 ? "array with " + res.list.length + " items" : res.list
                        }, null, 2)}
                    </pre>
                </>}
            </div>
}

export default function ProcessorPage() {
    return (
        <Layout title={gameName("Processor")} noCss mui>
            <HohApiWrapper>
                <ProcessorLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
