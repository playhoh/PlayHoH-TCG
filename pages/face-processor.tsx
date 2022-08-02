import React from 'react'
import {useUser} from "../src/client/userApi"
import {parseUrlParams} from "../src/utils"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Button} from "@mui/material"
import {LoginFirst} from "../components/LoginFirst"
import {Layout} from "../components/Layout"
import {FACE_API_URL, gameName} from "../components/constants"
import {HohApiWrapper} from "../src/client/clientApi"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"
import {Moralis} from "moralis"

export function FaceProcessorLogic() {
    const {user, isAuthenticated} = useUser()
    const [res, setRes] = React.useState(undefined)
    const [faceRes, setFaceRes] = React.useState(undefined)
    const params = parseUrlParams()
    const waitTime = params.waitTime || 200
    const parallel = params.parallel || 1
    const startPoint = params.startPoint ?? 0
    const auto = params.auto
    console.log("FACE_API_URL", FACE_API_URL())

    function iter(items: Moralis.Object[], processed, faces) {
        let item = items.pop()

        if (item) {
            let lastItem = item.get('name')
            const lastCardKey = item.get('key')?.replace("#", "")

            setRes(old => ({
                ...old,
                lastCall: new Date(),
                list: [...items],
                lastItem,
                lastCardKey,
                processed,
                created: faces
            }))

            const url = item.get('img')
            console.log("img of card " + item + " is of length " + url?.length)

            fetch(FACE_API_URL(), {
                method: "POST",
                body: JSON.stringify({url})
            }).then(x => x.json()).then(faceRes => {
                processed++
                setFaceRes(faceRes)
                if (!faceRes.error) {
                    item.set('data', {faces: faceRes})
                    faces += faceRes.faces?.length > 0 ? 1 : 0
                }
                item.save().then(() => {
                    if (auto)
                        if (items.length > 0) {
                            iter(items, processed, faces)
                        } else {
                            start()
                        }
                })
            })
        }
    }

    function start() {
        if (!res)
            setRes({started: new Date()})

        let query = new Moralis.Query("Card")
        query.doesNotExist("data")
        query.exists("img")
        query.find()
            .then(items => {
                if (items.length > 0) {
                    iter(items, 0, 0)
                } else {
                    setRes(old => ({...old, allDone: true}))
                }
            })
    }

    return !isAuthenticated ? <LoginFirst/>
        : !user.isAdmin ? <AskAnAdmin/>
            : <div>
                <h1>{'Process face recogintion for cards'}</h1>
                <Button color="primary" fullWidth variant="outlined"
                        onClick={() => start()}>
                    {'Start ' + (!auto ? "one call" : "auto call")}
                </Button>
                <br/>
                <pre>
                    Params: {JSON.stringify(params)}
                </pre>
                {res && <>
                    <pre>
                        Status: {res.processed} processed, {res.faces} imgs with face(s)
                        <br/>
                        Time Running: {Math.floor((res.lastCall - res.started) / 1000)}s, started: {asGmt(res.started)}
                        <br/>
                        Current: {res.lastItem}
                        <br/>
                        Items in pipeline: {res.list?.length}
                    </pre>
                    {res.lastCardKey &&
                        <a target="_blank" rel="noreferrer"
                           href={"/editor?q=" + res.lastCardKey}>
                            <img src={imgUrlForName(res.lastCardKey)} height="300"/>
                        </a>}
                    <pre>
                        {faceRes && JSON.stringify(faceRes, null, 2)}
                    </pre>
                    <pre>
                        {JSON.stringify(res, null, 2)}
                    </pre>
                </>}
            </div>
}

export default function FaceProcessorPage() {
    return (
        <Layout title={gameName("Processor")} noCss mui>
            <HohApiWrapper>
                <FaceProcessorLogic/>
            </HohApiWrapper>
        </Layout>
    )
}

export function asGmt(started: Date): string {
    return !started ? "" : started.toISOString().substring(0, 16).replace("T", " ") + "GMT"
}

