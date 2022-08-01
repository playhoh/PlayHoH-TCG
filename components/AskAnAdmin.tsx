import React from "react"
import Box from "@mui/material/Box"
import {LoginFirst} from "./LoginFirst"

export function AskAnAdmin() {
    return <Box sx={{flexGrow: 1}} style={{textAlign: "center"}}>
        {'Admin only content 🔒'}
        <br/>
        <LoginFirst admin/>
    </Box>
}
