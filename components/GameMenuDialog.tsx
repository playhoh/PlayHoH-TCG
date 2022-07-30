import React from "react"
import {Close} from "@mui/icons-material"
import {Box, Button, IconButton, Modal} from "@mui/material"
import Typography from "@mui/material/Typography"
import {TopSnackBar} from "./TopSnackBar"

type GameMenuDialogProps = {
    open: boolean
    closeFunction: () => void,
    concede: () => void,
    isShowingInfo: boolean,
    setShowingInfo: (value: boolean) => void
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

export function GameMenuDialog({open, closeFunction, isShowingInfo, setShowingInfo, concede}: GameMenuDialogProps) {
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
                <Typography id="modal-modal-description" sx={{mt: 2}}>
                    <Button fullWidth color="primary" onClick={closeFunction}>
                        {'Continue'}
                    </Button>
                    <br/>
                    <br/>
                    <Button fullWidth color={isShowingInfo ? "primary" : "info"}
                            onClick={() => setShowingInfo(!isShowingInfo)}>
                        {'Toggle info box on mouse over'}
                    </Button>
                    <br/>
                    <br/>
                    <Button fullWidth color="error" onClick={() => {
                        setEffect(true)
                        concede()
                        closeFunction()
                        window.location.href = "/home"
                    }}>
                        {'Concede'}
                    </Button>
                </Typography>

            </Box>
        </Modal>
    </>
}
