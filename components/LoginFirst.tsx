import {Link, Paper} from "@mui/material"
import React from "react"

export function LoginFirst() {
    return <Paper style={{padding: 30}}>
        <Link href="/start">Please login first</Link>
    </Paper>
}
