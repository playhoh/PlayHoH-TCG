import React from "react"
import {Close} from "@mui/icons-material"
import {Box, Button, IconButton, Modal, TextField} from "@mui/material"
import Typography from "@mui/material/Typography"
import {Card} from "../interfaces/cardTypes"
import {imgUrlForName} from "./AtlassianDragAndDrop"
import {CardFeedbackData} from "../interfaces/baseTypes"
import {MenuItemFixed, SelectFixed} from "./MenuItemFixed"
import {powerSymbol, witsSymbol} from "../src/cardData"

type VotingDialogProps = {
    card?: Card
    closeFunction: () => void,
    feedbackFunction: (feedback: CardFeedbackData) => void
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

export function VotingDialog({card, closeFunction, feedbackFunction}: VotingDialogProps) {
    const [feedback, setFeedback] = React.useState("This card is…")
    const [field, setField] = React.useState("text")
    const [vote, setVote] = React.useState(-1)

    return <Modal
        open={!!card}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                {'Feedback for this card'}
                <IconButton color="info"
                            onClick={closeFunction}><Close/></IconButton>
            </Typography>
            {card && <Typography id="modal-modal-description" sx={{mt: 2}}>
                {'Tell us what is off with this card'}
                <br/>
                <img src={imgUrlForName(card.key.replace(/#/g, ""))} width={400}/>
                <br/>
                <TextField variant="outlined" fullWidth value={feedback}
                           onChange={x => setFeedback(x.target.value)}
                           style={{background: "#222"}}></TextField>
                <br/>
                <SelectFixed fullWidth value={field} onChange={x => setField(x.target.value)}>
                    <MenuItemFixed value="name">{'Card name'}</MenuItemFixed>
                    <MenuItemFixed value="cost">{'Cost'}</MenuItemFixed>
                    <MenuItemFixed value="img">{'Image'}</MenuItemFixed>
                    <MenuItemFixed value="typeLine">{'Type line'}</MenuItemFixed>
                    <MenuItemFixed value="text">{'Rule text'}</MenuItemFixed>
                    <MenuItemFixed value="wits">{'Wits ' + witsSymbol}</MenuItemFixed>
                    <MenuItemFixed value="power">{'Power ' + powerSymbol}</MenuItemFixed>
                    <MenuItemFixed value="flavour">{'Year'}</MenuItemFixed>
                </SelectFixed>
                <br/>
                <SelectFixed fullWidth value={vote + ""} onChange={x => setVote(parseInt(x.target.value))}>
                    <MenuItemFixed value="-1">{'Too weak / irrelevant / bad'}</MenuItemFixed>
                    <MenuItemFixed value="0">{'Just about right'}</MenuItemFixed>
                    <MenuItemFixed value="1">{'Too powerful / game-breaking'}</MenuItemFixed>
                </SelectFixed>
            </Typography>}

            <br/>
            <Button disabled={!card} onClick={() => {
                const data = {
                    name: card.name,
                    field,
                    vote,
                    feedback
                } as CardFeedbackData
                feedbackFunction(data)
                closeFunction()
            }}>
                {'Submit'}
            </Button>
        </Box>
    </Modal>
}
