import React from "react"
import {InfoOutlined} from "@mui/icons-material"
import Typography from "@mui/material/Typography"

export const InfoBox = props =>
    <Typography color="darkgrey"
                style={{
                    width: props.width || 400,
                    marginTop: 32,
                    border: "1px solid darkgrey",
                    borderRadius: 14,
                    padding: 14
                }}>
        <InfoOutlined fontSize="small"/> {props.children}
    </Typography>