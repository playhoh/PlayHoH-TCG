import {Button, Grid, Link, Paper, Typography} from "@mui/material"
import {PlayCircle} from '@mui/icons-material'
import React from "react"
import {TextareaAutosize} from "@mui/base"
import {parseUrlParams} from "../src/utils"
import Head from "next/head"

const DbTestPage = () => {
    const [code, setCode] = React.useState<string | undefined>("select * from hoh_users")
    const [data, setData] = React.useState<any | undefined>(undefined)
    const [err, setErr] = React.useState<string | undefined>(undefined)
    const params = parseUrlParams()
    const debug = params.debug ? "?debug=" + params.debug : ""

    function runCode() {
        setData({loading: "..."})
        fetch("/api/db-console" + debug, {method: "POST", body: JSON.stringify({code, secret: params.secret})})
            .then(x => x.json())
            .then(x => setData(x))
    }

    return !params.secret ? "secret param was missing" :
        <main lang="en" style={{backgroundColor: "black"}}>
            <Head><title>DB Console</title></Head>
            <Paper>
                <Typography variant="h4">
                    {"DB"} | <Link href="/api/schema" target="_blank" rel="noreferrer">{'Schema'}</Link>
                </Typography>

                <Grid container spacing="2" marginTop={2}>
                    <Grid item xs={12}>
                        <TextareaAutosize style={{minWidth: 800, minHeight: 400}}
                                          inputMode="text"
                                          color="background"
                                          onKeyDown={e => {
                                              e.key == "Enter" && e.ctrlKey && runCode()
                                          }}
                                          onChange={e => setCode(e.target.value)} value={code}/>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="outlined"
                                onClick={() => runCode()}>
                            <PlayCircle fontSize="small"/> &nbsp;{'Run'}
                        </Button>
                    </Grid>

                    <Grid item xs={12} marginTop={8}>
                        <Typography variant="body1">
                            <pre>{
                                data?.info?.includes("query lead to non-json output")
                                    ? data?.data?.split("\n")?.map((x: string, i: number) =>
                                        <p key={i} dangerouslySetInnerHTML={{__html: x}}/>)
                                    : JSON.stringify(data, null, 2)}</pre>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </main>
}

export default DbTestPage
