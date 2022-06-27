import React from "react"
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {Button, Container, Switch, TextField} from "@mui/material"
import {useUser} from "../src/client/userApi"
import {LoginFirst} from "../components/LoginFirst"
import {debug} from "../src/utils"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {LoadingProgress} from "../components/LoadingProgress"
import {updateWikiCard} from "../src/client/cardApi"
import {Moralis} from "moralis"
import {CheckCircleOutlined} from "@mui/icons-material"
import {buildCardFromWiki} from "../src/cardCreation"
import {EffectsData} from "../interfaces/cardTypes"

const CreatorLogic = () => {
    const {isAuthenticated, user, userPointer, isLoggedOut, loggedOut, setLoggedOut} = useUser()
    const [text, setText] = React.useState("")
    const [card, setCard] = React.useState<any>({})
    const [img, setImg] = React.useState("")
    const [isPerson, setPerson] = React.useState(true)
    const [badWords, setBadWords] = React.useState<string[]>([])
    const [effects, setEffects] = React.useState<EffectsData>(undefined)

    React.useEffect(() => {
        fetch("/api/effects").then(x => x.json()).then(x => {
            setEffects(x)
        })
        fetch("/api/badWords").then(x => x.json()).then(x => {
            setBadWords(x)
        })
    }, [])

    function saveCard() {
        click(data => {
            debug("card", data)
            const Card = Moralis.Object.extend(isPerson ? "WikiPerson" : "WikiObject")
            let card1 = new Card()
            new Moralis.Query(Card).equalTo("name", data.name).first().then(found => {
                if (!found) {
                    const cardData = buildCardFromWiki(effects)(data, badWords)
                    updateWikiCard(card1, userPointer as any, data.name, cardData).then(x =>
                        setCard(d => ({...d, done: true}))
                    )
                }
            })
        })
    }

    function click(f?: (a: any) => void) {
        debug(text)
        setImg("")
        setCard(undefined)
        fetch("../api/wiki2card/" + text).then(x => x.json()).then(moreData => {
            setImg(moreData.img)
            setCard(moreData)
            f && f(moreData)
        })
    }

    return !isAuthenticated
        ? <LoginFirst/>
        : !user?.isAdmin
            ? <AskAnAdmin/>
            : <Container>
                <TextField
                    fullWidth autoFocus
                    value={text} onChange={x => setText(x.target.value)}
                    onKeyDown={x => x.key === 'Enter' && click()} placeholder="Wikipedia page"/>
                <br/>
                Is Person: <Switch onChange={(x, checked) => setPerson(checked)} checked={isPerson}/>
                <br/>

                <Button disabled={isLoggedOut} onClick={() => click()}>
                    Fetch page
                </Button>
                <Button disabled={isLoggedOut || !badWords || !effects} onClick={() => saveCard()}>
                    Save card {card?.done && <CheckCircleOutlined/>}
                </Button>

                {!card ?
                    <LoadingProgress/>
                    : <>
                        <h2>Existing card</h2>
                        {!card ? "" :
                            <img src={"/api/svg/" + encodeURIComponent(card?.name) + "?s=1"} alt="" width="400"/>}

                        <h2>Fetched data</h2>
                        <pre>{JSON.stringify(card, null, 2)}</pre>

                        {!img ? "" : <img src={img} alt="" width="400"/>}

                        {card?.firstName &&
                            <>
                                <hr/>
                                <h2>Faces for first name '{card.firstName}'</h2>
                                <img src={"../api/face/" + card.firstName || ""} alt=""/>
                            </>}

                        <h2>Wiki Text</h2>
                        <pre>{card?.wikitext}</pre>
                    </>}
            </Container>

}

export default function AdminPage() {
    return (
        <Layout noCss mui>
            <HohApiWrapper>
                <CreatorLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
