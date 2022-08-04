import React from "react"
import {Close} from "@mui/icons-material"
import {Box, Button, IconButton, Modal, Slider, Switch} from "@mui/material"
import Typography from "@mui/material/Typography"
import {TopSnackBar} from "./TopSnackBar"
import {baseGameNameShort, createIssueUrl, hohMail} from "./constants"

type GameMenuDialogProps = {
    open: boolean
    closeFunction: () => void,
    concede: () => void,
    isShowingInfo: boolean,
    setShowingInfo: (value: boolean) => void
    factor: number,
    setFactor: (value: number) => void
}

export const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
}

export function GameMenuDialog({
                                   open,
                                   closeFunction,
                                   isShowingInfo,
                                   setShowingInfo,
                                   concede,
                                   factor,
                                   setFactor
                               }: GameMenuDialogProps) {
    const [effect, setEffect] = React.useState(false)
    return <>
        {effect && <TopSnackBar fullScreen>
            {"Thank you for playing!"} 🙏
        </TopSnackBar>}
        <Modal
            open={!!open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {'Game Options'}
                    <IconButton color="info" onClick={closeFunction}><Close/></IconButton>
                </Typography>
                <br/>
                <Typography id="modal-modal-description" sx={{mt: 2}}
                            style={{display: "flex", flexFlow: "column", gap: 24}}>
                    <Button fullWidth variant="contained" color="primary" onClick={closeFunction}>
                        {'Continue'}
                    </Button>

                    <div style={{display: "flex", alignContent: "space-between", alignItems: "right", marginLeft: 24}}>
                        <Switch onChange={(ev, value) => {
                            setShowingInfo(!isShowingInfo)
                        }} value={isShowingInfo}></Switch>
                        <Typography
                            component="div"
                            sx={{display: {xs: 'none', sm: 'block'}}}>
                            {isShowingInfo ? 'Show info box on mouse over' : 'No info box on mouse over'}
                        </Typography>
                    </div>

                    {/*<div style={{display: "flex", alignContent: "space-between", alignItems: "right", marginLeft: 24}}>
                        <Slider step={0.05} valueLabelDisplay="auto"
                                aria-label="small" min={0.1} max={2} value={factor}
                                onChange={(ev, value: number) => {
                                    setFactor(value)
                                }} style={{width: "50%"}}/>
                        <Typography
                            component="div"
                            sx={{display: {xs: 'none', sm: 'block'}}}>
                            &nbsp;{"Card Zoom Factor"}
                        </Typography>
                    </div>*/}

                    <Button fullWidth color="info"
                            href={"mailto:" + hohMail + "?body=Hi%20team,%0AI%20just%20played%20a%20game%20of%20"
                                + encodeURIComponent(baseGameNameShort)
                                + "and%0A%0A&subject=Feedback%20on%20%" + encodeURIComponent(baseGameNameShort)}>
                        <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                            {'Send us a mail'}
                        </Typography>
                    </Button>

                    <Button fullWidth color="info" href={createIssueUrl} target="_blank" rel="noreferrer">
                        <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                            {'Create issue on github'}
                        </Typography>
                    </Button>

                    <Button variant="contained" fullWidth color="error" onClick={() => {
                        setEffect(true)
                        concede()
                        closeFunction()
                        window.location.href = "/home"
                    }}>
                        {'Concede and back to Home'}
                    </Button>
                </Typography>

            </Box>
        </Modal>
    </>
}
