import {Button, Grid, Link, Paper, TextField, Typography} from "@mui/material"
import {Download, PlayCircle, Upload} from '@mui/icons-material'
import React from "react"
import {TextareaAutosize} from "@mui/base"
import {escapeSql, parseUrlParams} from "../src/utils"
import Head from "next/head"

function getPlayers(player1: string, player2: string) {
    const arr = [player1, player2]
    arr.sort()
    const [a, b] = arr
    return {a, b}
}

const DbTest2Page = () => {
    const [code, setCode] = React.useState("select * from hoh_users")
    const [player1, setPlayer1] = React.useState("a")
    const [player2, setPlayer2] = React.useState("b")
    const [lastTimestamp, setLastTimestamp] = React.useState("")

    const [data, setData] = React.useState<any | undefined>(undefined)
    const [uploading, setUploading] = React.useState(false)
    const [downloading, setDownloading] = React.useState(false)
    const [err, setErr] = React.useState("")
    const params = parseUrlParams()
    const debug = params.debug ? "?debug=" + params.debug : ""

    function runCode(x: string, cont?: Function, withRes?: Function) {
        if (!withRes)
            setData({loading: "..."})

        fetch("/api/db-console" + debug,
            {method: "POST", body: JSON.stringify({code: x, secret: params.secret})})
            .then(x => x.json())
            .then(x => {
                if (withRes)
                    withRes(x)
                else
                    setData(x)

                if (cont)
                    cont()
            })
    }

    function loadStateNow() {
        setDownloading(true)
        const {a, b} = getPlayers(player1, player2)
        runCode(`select * from hoh_game where player1="${a}" and player2="${b}"`, () => setDownloading(false), x => {
            let state = x[0]?.state
            if (state)
                setCode(state)
            setData(x)
        })
    }

    function updateStateIfValid(code) {
        let err = ""
        try {
            const js = JSON.parse(code)
            const {a, b} = getPlayers(player1, player2)
            setUploading(true)
            runCode(
                `
update hoh_game set timestamp=now(), state='${JSON.stringify(js)}'
where player1="${escapeSql(a)}" and player2="${escapeSql(b)}"
`.trim(),
                () => setUploading(false))
        } catch (e) {
            err = e.toString()
        }

        setErr(err)
        setCode(code)
    }

    React.useEffect(() => {
        console.log("eff")
        let pending = false
        // const interval =
        setInterval(() => {
            console.log("eff tick")
            if (!pending) {
                pending = true
                const {a, b} = getPlayers(player1, player2)
                runCode(`
select timestamp from hoh_game where player1="${escapeSql(a)}" and player2="${escapeSql(b)}"
`.trim(),
                    () => pending = false,
                    x => {
                        console.log("interval ", x)
                        let newTimestamp = x[0]?.timestamp
                        if (new Date(newTimestamp).getTime() > new Date(lastTimestamp).getTime()) {
                            if (!uploading)
                                loadStateNow()
                        }
                        setLastTimestamp(newTimestamp)
                    })
            }
        }, 1300)

        // return clearInterval(interval)
    }, [])

    return !params.secret ? "secret param was missing" :
        <main lang="en" style={{backgroundColor: "black"}}>
            <Head><title>DB Console</title></Head>
            <Paper>
                <Typography variant="h4">
                    {"DB"} | <Link href="/api/schema" target="_blank" rel="noreferrer">{'Schema'}</Link>
                </Typography>

                <Grid container spacing="2" marginTop={2}>
                    <Grid item xs={6}>
                        <TextField placeholder="Player 1" onChange={e => setPlayer1(e.target.value)} value={player1}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField placeholder="Player 2" onChange={e => setPlayer2(e.target.value)} value={player2}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextareaAutosize style={{minWidth: 800, minHeight: 400}}
                                          inputMode="text"
                                          color="background"
                                          onChange={e => {
                                              const code = e.target.value
                                              updateStateIfValid(code)
                                          }} value={code}/>
                    </Grid>

                    <Grid item xs={6}>
                        <Button variant="outlined"
                                onClick={() => {
                                    loadStateNow()
                                }}>
                            <PlayCircle fontSize="small"/> &nbsp;{'Load state now'}
                        </Button>
                    </Grid>

                    <Grid item xs={6}>
                        <Upload fontSize="small" style={{opacity: uploading ? 1 : 0.5}}/> &nbsp;{'Upload'} |
                        <Download fontSize="small" style={{opacity: downloading ? 1 : 0.5}}/> &nbsp;{'Download'} |
                        {lastTimestamp}
                    </Grid>

                    <Grid item xs={12} marginTop={8}>
                        <Typography variant="body1">
                            <pre>{
                                data?.info?.includes("query lead to non-json output")
                                    ? data?.data?.split("\n")?.map((x: string, i: number) =>
                                        <p key={i} dangerouslySetInnerHTML={{__html: x}}/>)
                                    : JSON.stringify(data, null, 2)}</pre>
                            <pre>{err ? "Error: " + err : ""}</pre>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </main>
}

export default DbTest2Page
