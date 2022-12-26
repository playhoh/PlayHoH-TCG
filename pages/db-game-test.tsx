import {Button, Grid, Link, Paper, TextField, Typography} from "@mui/material"
import {Download, PlayCircle, Upload} from '@mui/icons-material'
import React from "react"
import {TextareaAutosize} from "@mui/base"
import {apiCall, parseUrlParams} from "../src/utils"
import Head from "next/head"

const DbTest2Page = () => {
    const [player1, setPlayer1] = React.useState("a")
    const [player2, setPlayer2] = React.useState("b")
    const [lastTimestamp, setLastTimestamp] = React.useState(0)
    const [data, setData] = React.useState<any | undefined>(undefined)

    const [uploading, setUploading] = React.useState(false)
    const [downloading, setDownloading] = React.useState(false)

    const [err, setErr] = React.useState("")
    const params = parseUrlParams()
    const debug = params.debug ? "?debug=" + params.debug : ""


    /*function runCode(x: string, cont?: Function, withRes?: Function) {
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
    }*/

    function loadStateNow() {
        setDownloading(true)
        apiCall("/api/v2/game", "POST", {player1, player2}, x => {
            setDownloading(false)
            let state = x?.state
            if (state)
                setData(state)
            //setCode(state)
        })
    }

    function updateStateIfValid(data) {
        let err = ""
        try {
            const js = JSON.parse(data)
            setUploading(true)
            apiCall("/api/v2/game", "PUT", {player1, player2, state: js}, () => {
                setUploading(false)
            })
        } catch (e) {
            err = e.toString()
        }

        setErr(err)
        setData(data)
    }

    React.useEffect(() => {
        console.log("eff")
        let pending = false
        const interval =
            setInterval(() => {
                console.log("eff tick")
                if (!pending) {
                    pending = true
                    apiCall("/api/v2/ts", "POST", {player1, player2}, x => {
                        pending = false
                        console.log("interval ", x)
                        let newTimestamp = x?.timestamp
                        let lastTimestamp = 0
                        setLastTimestamp(x => {
                            lastTimestamp = x
                            return x
                        })
                        let loadNew = new Date(newTimestamp).getTime() > new Date(lastTimestamp).getTime()
                        //console.log("new Date(newTimestamp).getTime() > new Date(lastTimestamp).getTime()",
                        //    new Date(newTimestamp).getTime(), ">", new Date(lastTimestamp).getTime(), "===", loadNew)
                        if (loadNew) {
                            if (!uploading)
                                loadStateNow()
                        }
                        setLastTimestamp(newTimestamp)
                    })
                }
            }, 1300)

        return () => clearInterval(interval)
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
                                          disabled={uploading}
                                          onChange={e => {
                                              const data = e.target.value
                                              updateStateIfValid(data)
                                          }} value={data}/>
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
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                            <pre>{err ? "Error: " + err : ""}</pre>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </main>
}

export default DbTest2Page
