import {Grid, Link, Paper} from "@mui/material"
import React from "react"

export function LoginFirst() {
    return <Paper style={{padding: 30, background: "black", fontSize: "200%"}}>
        <Grid container justifyContent="center">
            <Link fontSize="large" href="/start">Please login first</Link>
        </Grid>
    </Paper>
}
