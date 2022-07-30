import React from "react"

export const TopSnackBar = props =>
    <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        fontSize: "150%",
        color: props.fullScreen ? "#ffffff" : "#ffffff90",
        bottom: props.fullScreen ? 0 : undefined,
        backgroundColor: props.fullScreen ? "#000000ee" : undefined
    }}>
        {props.children}
    </div>