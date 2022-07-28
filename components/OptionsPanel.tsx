import React from "react"
import {Close, ContentCopy} from "@mui/icons-material"
import {Box, Button, IconButton, Modal, Switch, TextField, Tooltip} from "@mui/material"
import Typography from "@mui/material/Typography"
import {changeUserData} from "../src/client/userApi"

type OptionsPanelProps = {
    user?: any
    userPointer?: any
    setShowingOptions: (value: boolean) => void
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
}

export function OptionsPanel({user, userPointer, setShowingOptions}: OptionsPanelProps) {
    const [message, setMessage] = React.useState("")
    const [username, setUsername] = React.useState("")

    const [animation, setAnimation] = React.useState(() => {
        let animation1 = userPointer.get('data')?.animation
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

            <Typography
                component="div"
                sx={{display: {xs: 'none', sm: 'block'}}}>
                Input
            </Typography>

            <div style={{display: "flex", alignContent: "space-between", alignItems: "center"}}>
                <Switch onChange={(ev, value) => {
                    changeUserData(userPointer, d => ({...d, animation: value}))
                    setAnimation(value)
                }} value={animation}></Switch>
                <Typography
                    component="div"
                    sx={{display: {xs: 'none', sm: 'block'}}}>
                    {animation ? "Drag and Drop" : "Simple Tap"}
                </Typography>
            </div>

            <Typography
                component="div"
                sx={{display: {xs: 'none', sm: 'block'}}}>
                Account
            </Typography>

            <div style={{display: "flex", alignContent: "space-between", alignItems: "center"}}>

                <Button onClick={() => {
                    setMessage('This cannot be undone, are you sure?')
                }}>Delete my account</Button>

                <Modal
                    open={!!message}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description">
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            {'Delete account?'}
                            <IconButton color="info"
                                        onClick={() => setMessage("")}><Close/></IconButton>
                        </Typography>
                        <Typography id="modal-modal-description" sx={{mt: 2}}>
                            {message}
                            <br/>
                            {'Enter your username to confirm deletion.'} ({user.username})
                            <Tooltip
                                title={'Copy your username to clipboard'}><IconButton
                                onClick={() => {
                                    navigator?.clipboard?.writeText(user?.username)
                                }} color="info">
                                <ContentCopy/>
                            </IconButton></Tooltip>
                        </Typography>
                        <br/>
                        <TextField variant="outlined" fullWidth value={username}
                                   onChange={x => setUsername(x.target.value)}
                                   style={{background: "#222"}}></TextField>
                        <br/>
                        <Button disabled={username !== user.username} onClick={() => {
                            userPointer.destroy().then(() => {
                                setMessage("Account deleted, thanks for trying the game out 💪 Redirecting... ⌛")
                                setTimeout(() => window.location.href = "/start", 3000)
                            })
                        }}>
                            {'Yes, delete my account'}
                        </Button>
                    </Box>
                </Modal>
            </div>
        </div>
    </>
}
