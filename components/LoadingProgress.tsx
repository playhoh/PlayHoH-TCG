import React from 'react'
import {CircularProgress, Grid, Paper} from "@mui/material"

export function LoadingProgress() {
    return <Paper style={{padding: 30}}>
        <Grid container justifyContent="center">
            <CircularProgress/>
        </Grid>
    </Paper>
}
