import React, {useEffect} from 'react'
import Layout from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {logOut, useUser} from "../src/client/userApi"
import {baseGameNameShort, gameName} from "../components/constants"
import {Badge, Button, IconButton} from "@mui/material"
import {FavoriteOutlined, Logout, SkipNext, SkipPrevious, ThumbDown} from "@mui/icons-material"
import {availableCardNames, cardImgUrlForName, hiresCardHeight, hiresCardWidth, predefinedDecks} from "../src/cardData"
import {capitalize, debug, repeat} from "../src/utils"
import {SimpleTooltip} from "../components/SimpleTooltip"
import {DeckSelect} from "../components/DeckSelect"
import {LoginFirst} from "../components/LoginFirst"
import {LoadingProgress} from "../components/LoadingProgress"
import {useRouter} from "next/router"
import {JoinDiscord} from "../components/JoinDiscord"

let resourceSymbol = <>&#x25B3;</>
let phys2Symbol = <>&#x1F441;</>
let physSymbol = <>&#x270A;</>
let witsSymbol = <>&#x233E;</>
let height = 444

let allCards = availableCardNames()

export function HomeLogic() {
    const {user, userPointer, isAuthenticated} = useUser()
    const [start, setStart] = React.useState(0)
    const [allDecks, setAllDecks] = React.useState(predefinedDecks)
    const [deckCards, setDeckCards] = React.useState([])
    const [cards, setCards] = React.useState(allCards)

    function vote(name: string, delta: number) {
        debug("vote", name, delta, "by user with session", user?.sessionToken)

        setCards(cards.filter(x => x !== name))

        fetch("/api/vote", {
            method: "POST",
            body: JSON.stringify({name, delta, sessionToken: user?.sessionToken})
        }).then(x => x.json()).then(x => {
            debug("vote result", x)
        })
    }

    function getImg(name: string, voting?: boolean, heightOverride?: number, style?: any) {
        let actualHeight = heightOverride === undefined ? height : heightOverride
        const img = <img src={cardImgUrlForName(name, true)}
                         height={actualHeight}
                         width={Math.floor(actualHeight / hiresCardHeight * hiresCardWidth)}
                         alt="" style={style || {}}/>

        return !voting ? img : <div key={name}>
            <Badge anchorOrigin={{vertical: "bottom", horizontal: "left"}}
                   badgeContent={<IconButton color="info" onClick={() => vote(name, -1)}>
                       <ThumbDown fontSize="large"/>
                   </IconButton>}>
                <Badge anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                       badgeContent={<IconButton color="error" onClick={() => vote(name, +1)}>
                           <FavoriteOutlined fontSize="large"/>
                       </IconButton>}>
                    {img}
                </Badge>
            </Badge>
        </div>
    }

    function fetchDeck(id) {
        fetch("/api/deck/" + id).then(x => x.json()).then(deckObj => {
            deckObj?.deck && setDeckCards(deckObj.deck)
        })
    }

    useEffect(() => {
            /*fetch("/api/allDecks").then(x => x.json()).then(allDecksValue => {
                allDecksValue && setAllDecks(allDecksValue)
            })*/

            fetchDeck(user?.deck || "beta1")

            user && fetch("/api/votes/" + user?.username).then(x => x.json()).then(votes => {
                setCards(allCards.filter(x => !votes.find(y => y.name === x)))
            })

        }, []
    )
    const router = useRouter()
    const [loggingOut, setLoggingOut] = React.useState(false)

    return loggingOut ? <LoadingProgress/> : !isAuthenticated ? <LoginFirst/> : !user ? <LoadingProgress/> :
        <div className="homeContainer homeWrapper">
            <div className="homeTitle">
                <h1>
                    {'Welcome to ' + baseGameNameShort + ', ' + capitalize(user?.displayName) + '.'}
                </h1>
            </div>
            <div className="homeOptions">
                <Button disabled={loggingOut} size="large" color="info" onClick={() => {
                    setLoggingOut(true)
                    logOut(() => {
                        window.location.href = "/start"
                    })
                }}>
                    <Logout fontSize="large"/> {'Log out'}
                </Button>
            </div>

            <div className="homeDecks">
                <h1>{'Your Deck'}</h1>

                <DeckSelect onChange={deck => {
                    fetchDeck(deck)
                }}/>

                <div style={{height: 20}}/>

                {deckCards?.map((x, i) =>
                    <SimpleTooltip title={getImg(x.name, false, undefined, {marginLeft: -122})} placement="left">
                        <div className="homeDeckCard" key={i}>
                            <span className="homeDeckCardName">
                                {x.name}
                            </span>
                            <span className="homeDeckCardCost">
                                {x.cost ? repeat(x.cost, "△").join("") : "Archetype"}
                            </span>
                        </div>
                    </SimpleTooltip>
                )}
            </div>

            <div className="homeMain">
                <h1>{'Newest Cards'}</h1>
                <span>{'Please let us know how you like these:'}</span>
                <div className="homeCardsSection">
                    <div/>
                    {cards.slice(start, start + 2).filter(x => x).map(x =>
                        getImg(x, true)
                    )}
                    <div/>
                </div>

                <div className="homeNextPrev">
                    <IconButton disabled={start === 0} size="large" color="info" onClick={() => setStart(start - 1)}>
                        <SkipPrevious fontSize="large"/>
                    </IconButton>
                    <IconButton disabled={start >= cards.length - 2} size="large" color="info"
                                onClick={() => setStart(start + 1)}>
                        <SkipNext fontSize="large"/>
                    </IconButton>
                </div>
            </div>

            <div className="homeMain">
                {/* preload next page, <img> with height 0, same position, it needs to be somewhere */}
                {cards.slice(start + 2, start + 4).filter(x => x).map(x =>
                    getImg(x, false, 0)
                )}
            </div>

            <div className="homeCommunity">
                <JoinDiscord simple/>
            </div>

            <div className="homeActions">
                <Button variant="outlined" size="large" color="info" href="/solo">
                    {'Learn how to play'}
                </Button>

                <Button variant="outlined" size="large" color="info" href="/now">
                    {'Challenge another player'}
                </Button>
            </div>
        </div>
}

export default function HomePage() {
    return (
        <Layout title={gameName("Home")} noCss gameCss mui>
            <HohApiWrapper>
                <HomeLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
