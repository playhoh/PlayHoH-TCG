import React from 'react'
import {useUser} from "../src/client/userApi"
import {BASE_URL, parseUrlParams, shuffle, toSet} from "../src/utils"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Button} from "@mui/material"
import {LoginFirst} from "../components/LoginFirst"
import {Layout} from "../components/Layout"
import {gameName} from "../components/constants"
import {HohApiWrapper} from "../src/client/clientApi"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"

export function ProcessorLogic() {
    const {user, isAuthenticated} = useUser()
    const [list, setList] = React.useState([])
    const [res, setRes] = React.useState(undefined)
    const [card, setCardRes] = React.useState(undefined)
    const [createRes, setCreateRes] = React.useState(undefined)

    const params = parseUrlParams()
    const waitTime = params.waitTime || 200
    const parallel = params.parallel || 1
    const startPoint = params.startPoint ?? 0
    const auto = params.auto

    function start(items, created, processed) {
        let currentData = undefined
        setRes(old => {
            currentData = old
            return old ? ({
                ...old,
                lastCall: new Date(),
                processed,
                created
            }) : {started: new Date()}
        })

        const a =
            !currentData
                ?
                fetch(BASE_URL + "/api/dbpedia/" + startPoint).then(x => x.json()).then(x => items = x)
                :
                items?.length > 0
                    ? Promise.all(Array.from({length: parallel}).map(() => {
                        const name = items.pop()

                        const b =
                            items.length < 100 && items.length % 4 === 0
                                ?
                                fetch(BASE_URL + "/api/dbpedia/" + name).then(x => x.json())
                                    .then(newItems => {
                                        items = shuffle(toSet(
                                            [...newItems, ...items]
                                        ))
                                    })
                                : Promise.resolve()
                        return b.then(() => {
                            return fetch(BASE_URL + "/api/cards/create", {
                                method: "POST",
                                body: JSON.stringify({sessionToken: user?.sessionToken, name})
                            }).then(x => x.json()).then(createdResult => {
                                processed++
                                setCreateRes(createdResult)
                                let card1 = createdResult.card
                                if (card1) {
                                    setCardRes(card1)
                                    created++
                                }
                            })
                        })
                    }))
                    :
                    Promise.resolve()

        a.then(() => {
            setList(items)
            if (auto && items.length > 0)
                setTimeout(() => {
                    start(items, created, processed)
                }, waitTime)
        })
    }

    return !isAuthenticated ? <LoginFirst/>
        : !user.isAdmin ? <AskAnAdmin/>
            : <div>
                <h1>{'Process cards'}</h1>
                <Button color="primary" disabled={!!res} fullWidth variant="outlined"
                        onClick={() => start(undefined, 0, 0)}>
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
                        Time Running: {Math.floor((res.lastCall - res.started) / 1000)}s, started: {asGmt(res.started)}
                        <br/>
                        Current: {card?.name}
                        <br/>
                        Items in pipeline: {list.length}
                    </pre>
                    {card && card.key &&
                        <a target="_blank" rel="noreferrer"
                           href={"/editor?q=" + card.key?.replace("#", "")}>
                            <img src={imgUrlForName(card.key?.replace("#", ""))} height="300"/>
                        </a>}

                    <pre>
                        {JSON.stringify(createRes, null, 2)}
                        <br/>
                        {JSON.stringify(list.length > 10 ? "array with " + list.length + " items" : list, null, 2)}
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

export function asGmt(started: Date): string {
    return !started ? "" : started.toISOString().substring(0, 16).replace("T", " ") + "GMT"
}

