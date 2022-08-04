import React, {ReactNode} from "react"
import {Close} from "@mui/icons-material"
import {Box, IconButton, Modal} from "@mui/material"
import Typography from "@mui/material/Typography"
import {Card} from "../interfaces/cardTypes"

type CardsInZoneDialogProps = {
    info: string,
    closeFunction: () => void,
    cardsZone?: ReactNode
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

export function CardsInZoneDialog({info, cardsZone, closeFunction}: CardsInZoneDialogProps) {
    return <>
        <Modal
            open={!!cardsZone}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {info}
                    <IconButton color="info" onClick={closeFunction}><Close/></IconButton>
                </Typography>
                {cardsZone &&
                    <Typography id="modal-modal-description" sx={{mt: 2}} style={{display: "flex", columnGap: 12}}>
                        <div>
                            {cardsZone}
                        </div>
                    </Typography>}
            </Box>
        </Modal>
    </>
}
