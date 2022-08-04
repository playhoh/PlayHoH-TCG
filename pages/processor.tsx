import React from 'react'
import {useUser} from "../src/client/userApi"
import {asGmt, parseUrlParams, secondsBetween, shuffle, toSet} from "../src/utils"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Button} from "@mui/material"
import {Layout} from "../components/Layout"
import {gameName} from "../components/constants"
import {HohApiWrapper} from "../src/client/clientApi"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"

export function ProcessorLogic() {
    const {user} = useUser()
    const [list, setList] = React.useState([])
    const [res, setRes] = React.useState<any>({status: "not started"})
    const [card, setCardRes] = React.useState(undefined)
    const [createRes, setCreateRes] = React.useState(undefined)
    const [error, setError] = React.useState(undefined)
    const [started, setStarted] = React.useState(false)

    const params = parseUrlParams()
    const waitTime = params.waitTime || 200
    // const parallel = params.parallel || 1
    const startPoint = params.startPoint ?? "Cultural_artifact"
    const auto = params.auto

    function start(items, created, processed, item) {
        setRes(old => ({
            ...old,
            item,
            lastCall: new Date(),
            processed,
            created,
            started: old.started || new Date(),
            done: undefined
        }))
        setList(items)
        //Promise.all(Array.from({length: parallel}).map(() => {
        item = items.pop()
        if (!item) {
            setRes(old => ({
                ...old,
                done: true
            }))
        } else {
            const b =
                items.length < 100 && items.length % 4 === 0
                    ?
                    fetch("/api/dbpedia/" + item).then(x => x.json())
                        .then(newItems => {
                            items = shuffle(toSet(
                                [...newItems, ...items]
                            ))
                        }).catch(x => setError(x))
                    : Promise.resolve()
            b.then(() => {
                return fetch("/api/cards/create", {
                    method: "POST",
                    body: JSON.stringify({sessionToken: user?.sessionToken, name: item})
                }).then(x => x.json()).then(createdResult => {
                    processed++
                    if (createdResult) {
                        setCreateRes(createdResult)
                        let card1 = createdResult.card
                        if (card1 && createdResult.success) {
                            setCardRes(card1)
                            created++
                        }
                    }
                    if (auto && items.length > 0)
                        setTimeout(() => {
                            start(items, created, processed, item)
                        }, waitTime)
                }).catch(x => setError(x))
            })
        }
        /*})).then(() => {
          */
    }

    return !user?.isAdmin ? <AskAnAdmin/>
        : <div>
            <h1>{'Process cards'}</h1>
            <Button color="primary" disabled={started} fullWidth variant="outlined"
                    onClick={() => {
                        setStarted(true)
                        start(
                            [startPoint],
                            0, 0, "(list route first, key: " + startPoint + ")")
                    }}>
                {'Start ' + (!auto ? "one call" : "auto call")}
            </Button>
            <br/>
            <pre>
                Params: {JSON.stringify(params)}
            </pre>
            {res && <>
                    <pre>
                        Status: {res.processed} processed, {res.created} created {res.done ? ", Done" : ""}
                        <br/>
                        Time Running: {res.lastCall && secondsBetween(res.lastCall, res.started)}s, started: {asGmt(res.started)}
                        <br/>
                        Current item: {res.item}
                        <br/>
                        Card Data: {card?.name} ({card?.typeLine}) {card?.flavour}
                        <br/>
                        Result: {createRes?.error}
                        <br/>
                        Items in pipeline: {list.length}
                    </pre>

                {card && card.key &&
                    <a target="_blank" rel="noreferrer"
                       href={"/editor?q=" + card.key?.replace("#", "")}>
                        <img src={imgUrlForName(card.key?.replace("#", ""))} height="300"/>
                    </a>}

                <pre>
                    {error ? "Error: " + error : ""}
                    <br/>
                    {JSON.stringify({
                        ...createRes,
                        img: createRes?.img ? "(omitted, chars: " + createRes?.img?.length + ")" : undefined
                    }, null, 2)}
                    <br/>
                    {JSON.stringify(
                        list.length > 10 ? "array with " + list.length + " items" : list,
                        null, 2)}
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
