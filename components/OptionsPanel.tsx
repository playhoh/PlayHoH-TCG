import React from "react"
import {Close} from "@mui/icons-material"
import {debug} from "../src/utils"
import {IconButton, Switch} from "@mui/material"
import Typography from "@mui/material/Typography"
import {changeUserData} from "../src/client/userApi"

type OptionsPanelProps = {
    user?: any
    userPointer?: any
    setShowingOptions: (value: boolean) => void
}

export function OptionsPanel({user, userPointer, setShowingOptions}: OptionsPanelProps) {
    const data = () => userPointer.get('data')
    const [animation, setAnimation] = React.useState(() => {
        let animation1 = data()?.animation;
        return animation1 === undefined ? true : animation1
    })
    return <>
        <h1>
            Options
            <IconButton color="info" onClick={() => setShowingOptions(false)}>
                <Close fontSize="large"/>
            </IconButton>
        </h1>

        <div style={{width: 200}}>
            {/*user?.data
            {JSON.stringify(user?.data)}
            <br/>
            {JSON.stringify(user, null, 2)}
            <br/>*/}
            <div style={{display: "flex", alignContent: "space-between", alignItems: "center"}}>
                <Switch onChange={(ev, value) => {
                    changeUserData(userPointer, d => ({...d, animation: value}))
                    setAnimation(value)
                }} value={animation}></Switch>
                <Typography
                    component="div"
                    sx={{display: {xs: 'none', sm: 'block'}}}>
                    {animation ? "Animation" : "No Animation"}
                </Typography>
            </div>
        </div>
    </>
}