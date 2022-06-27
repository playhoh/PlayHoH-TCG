import React, {useEffect} from 'react'
import {Layout} from "../components/Layout"
import {HohApiWrapper, processAllInQuery} from "../src/client/baseApi"
import {gameName, TRIGGER_SECRET_KEY} from "../components/constants"
import {Button, Container, TextField, Typography} from "@mui/material"
import {getIdNumberFromName, recreateSetId} from "../src/cardCreation"
import {anglicize} from "../src/utils"
import {LoadingProgress} from "../components/LoadingProgress"
import {useUser} from "../src/client/userApi"
import {AskAnAdmin} from "../components/AskAnAdmin"

export function TestingLogic() {
    const {user} = useUser()
    const [badWords, setBadWords] = React.useState([])
    const [message, setMessage] = React.useState("")
    const [size, setSize] = React.useState("")
    const [div, setDiv] = React.useState("")
    const [res, setRes] = React.useState("")
    const [res2, setRes2] = React.useState("")
    const [table, setTable] = React.useState("WikiPerson")

    useEffect(() => {
            fetch("/api/badWords").then(x => x.json()).then(setBadWords)
        }, []
    )

    function param() {
        return {size: parseFloat(size), div: parseFloat(div)}
    }

    function assignNewIds() {
        let counter = 0
        processAllInQuery(table,
            q => q.exists("name"),
            (item, i) => {
                let name = item.get('name')
                item.set('key', recreateSetId(name, badWords))
                counter++
                return item.save() //Promise.resolve()
            })
            .then(() => {
                setRes2("Assigned new ids: " + counter)
            })
    }

    function uniquenessTest() {
        const found = {}
        const duplicates = {}
        let p = 0
        setRes("Loading...")
        setRes2("")

        processAllInQuery(table,
            q => q.exists("name")
            // .exists("data.wikitext")
            //q.exists("key")
            , (item, i) => {

                // const x = item.get('key')
                let name = item.get('name')
                if (!found[name]) {
                    found[name] = true
                    const x = recreateSetId(name, badWords)
                    duplicates[x] = (duplicates[x] || []).concat(name)
                    p++
                }
                return Promise.resolve()
            }).then(() => {
            const d = Object.keys(duplicates)
                .filter(x => duplicates[x].length > 1)
                .map(x => x + ": " + duplicates[x].join(", "))
            setRes(
                "Processed " + p + " items"
                + "\nDUPLICATES " + d.length + ":\n"
                + d.join("\n")
            )
            const d2 = Object.keys(duplicates)
                .filter(x => duplicates[x].length == 1)
                .map(x => x + ": " + duplicates[x].join(", "))
            setRes2(
                "Data\n" + d2.join("\n")
            )
        })
    }

    return !user?.isAdmin ? <AskAnAdmin/> : <Container>
        <Typography>Testing</Typography>
        <Container>
            <Button variant="outlined" size="large" color="info" href="/admin">
                {'Admin Panel'}
            </Button>
            <Button variant="outlined" size="large" color="info" href="/mint">
                {'Minter'}
            </Button>
            <Button variant="outlined" size="large" color="info" href={"/api/trigger/" + TRIGGER_SECRET_KEY}>
                {'Trigger Api'}
            </Button>
            <Button variant="outlined" size="large" color="info"
                    onClick={uniquenessTest}>
                {'Uniqueness test'}
            </Button>
            <Button variant="outlined" size="large" color="info"
                    onClick={assignNewIds}>
                {'assignNewIds'}
            </Button>
            <pre>{res}</pre>
            {!badWords ? <LoadingProgress/>
                : <Container>
                    Table:
                    <br/>
                    <TextField value={table} onChange={x => setTable(x.target.value)}/>
                    <br/>
                    Size:
                    <br/>
                    <TextField value={size} onChange={x => setSize(x.target.value)}/>
                    <br/>
                    Div:
                    <br/>
                    <TextField value={div} onChange={x => setDiv(x.target.value)}/>
                    <br/>
                    Input:
                    <br/>
                    <TextField value={message} onChange={x => setMessage(x.target.value)}/>
                    <br/>
                    anglicize {anglicize(message)}
                    <br/>
                    getIdNumberFromName {getIdNumberFromName(message, param())}
                    <br/>
                    recreateSetId {recreateSetId(message, badWords)}
                </Container>}
            <pre>{res2}</pre>
        </Container>
    </Container>
}

export default function HomePage() {
    return (
        <Layout title={gameName("TestingLogic")} noCss mui>
            <HohApiWrapper>
                <TestingLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
