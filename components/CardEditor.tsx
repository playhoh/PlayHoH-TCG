import * as React from 'react'
import {Button, Container} from "@mui/material"
import {styled} from "@mui/material/styles"
import InputBase from "@mui/material/InputBase"
import {updateCard} from "../src/client/cardApi"

const StyledInputBase = styled(InputBase)(({theme}) => ({
    background: 'transparent',
    color: 'primary',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: 120,
    }
}))

export const CardEditor = ({card, setCard, user, setQueryText, search}) => {
    const [err, setErr] = React.useState(undefined)
    const [name, setName] = React.useState('')
    const [cost, setCost] = React.useState('')
    const [wits, setWits] = React.useState('')
    const [power, setPower] = React.useState('')
    const [url, setUrl] = React.useState('')
    React.useEffect(() => {
        setName(card?.name)
        setCost(card?.cost)
        setWits(card?.wits)
        setPower(card?.power)
        setUrl(card?.url)
    }, [!!card])

    const states = {name, setName, cost, setCost, wits, setWits, power, setPower, url, setUrl}

    function input(field) {
        let setter = states['set' + field.charAt(0).toUpperCase() + field.substring(1)]
        const onChange = x => {
            const v = x.target.value
            setter(v)
            if (card && card.set)
                card.set(field, v)
        }
        return {placeholder: field, label: field, variant: 'outlined', value: states[field], onChange, className: ""}
    }

    return !card ? "" : <Container>
        <div style={{display: "grid"}}>
            <StyledInputBase {...input('name')}/>
            <StyledInputBase {...input('cost')}/>
            <StyledInputBase {...input('url')}/>
            <StyledInputBase {...input('wits')}/>
            <StyledInputBase {...input('power')}/>
            <br/>
            <br/>
            <img src={url} width="500"/>
            Card: {JSON.stringify(card)}
            <br/>
            ERR: {JSON.stringify(err)}
        </div>
        <Button onClick={() => updateCard(card, setCard, setErr)}>{'Save'}</Button>
    </Container>
}