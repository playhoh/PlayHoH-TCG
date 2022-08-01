import {Grid, Link, Paper} from "@mui/material"
import React from "react"

export function LoginFirst(props) {
    return <Paper style={{padding: 30, background: "black", fontSize: "200%"}}>
        <Grid container justifyContent="center">
            <Link fontSize="large" href="/start">
                {props.admin ? 'Please login as an admin' : 'Please login first'}
            </Link>
        </Grid>
    </Paper>
}
