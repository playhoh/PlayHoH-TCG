import React from "react"
import {Button, Container, TextField} from "@mui/material"
import {useUser} from "../src/client/userApi"
import {LoginFirst} from "../components/LoginFirst"
import {debug, shortenWithLength} from "../src/utils"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/clientApi"
import {cardImgUrlForName} from "../src/cardData"

const CreatorLogic = () => {
    const {isAuthenticated, user} = useUser()
    const [name, setName] = React.useState("")
    const [fix, setFix] = React.useState('{"fixes": "here as json, e.g. flavour, imgPos, skipImg"}')
    const [res, setRes] = React.useState(undefined)
    const create = async () => {
        setRes({status: "Creating card for " + name + "..."})
        fetch("/api/cards/create", {
            method: "POST",
            body: JSON.stringify({name, fix: JSON.parse(fix), sessionToken: user?.sessionToken})
        }).then(x => x.json()).then(x => {
            debug("create result", x)
            if (x && x.card) {
                x.card.img = "<omitted>"
                x.card.comment = shortenWithLength(x.card.comment)
                if (x.card.gen)
                    x.card.gen.abstract = shortenWithLength(x.card.gen.abstract)
            }
            setRes(x)
        })
    }

    let key = res?.card?.key?.replace("#", "")
    return !isAuthenticated
        ? <LoginFirst/>
        : !user?.isAdmin ? <AskAnAdmin/> : <Container>
            <h2>{'Create a card manually'}</h2>
            <TextField fullWidth variant="outlined" value={name} onChange={x => setName(x.target.value)}/>
            <br/>
            <TextField error={(() => {
                try {
                    JSON.parse(fix)
                } catch (e) {
                    return true
                }
            })()} fullWidth variant="outlined" value={fix} onChange={x => setFix(x.target.value)}/>
            <br/>
            <Button fullWidth variant="contained" color="primary" disabled={!name} onClick={create}>{'Create'}</Button>
            <br/>
            {key && <>
                <Button href={"/editor?q=" + key} fullWidth target="_blank" rel="noreferrer">{'Edit'}</Button>
                <br/>
                <img src={cardImgUrlForName(key) + "?nc=1"}/>
                <br/>
            </>}
            <pre>{res && JSON.stringify(res, null, 2)}</pre>
        </Container>
}

export default function CreatorPage() {
    return (
        <Layout noCss mui>
            <HohApiWrapper>
                <CreatorLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
