import React, {useEffect} from 'react'
import Layout from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {useUser} from "../src/client/userApi"
import {gameName} from "../components/constants"
import {Badge, Button, IconButton} from "@mui/material"
import {FavoriteOutlined, SkipNext, SkipPrevious, ThumbDown} from "@mui/icons-material"
import {availableCardNames, cardImgUrlForName, predefinedDecks} from "../src/cardData"
import {debug, repeat} from "../src/utils"
import {SimpleTooltip} from "../components/SimpleTooltip"
import {DeckSelect} from "../components/DeckSelect"

let resourceSymbol = <>&#x25B3;</>
let phys2Symbol = <>&#x1F441;</>
let physSymbol = <>&#x270A;</>
let witsSymbol = <>&#x233E;</>
let height = 444

function vote(name: string, delta: number) {
    debug("vote", name, delta)
}

function getImg(name: string, voting?: boolean, heightOverride?: number, style?: any) {
    const img = <img src={cardImgUrlForName(name, true)}
                     height={heightOverride === undefined ? height : heightOverride}
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

function HomeLogic() {
    const {user, userPointer, isAuthenticated} = useUser()
    const [start, setStart] = React.useState(0)
    const [allDecks, setAllDecks] = React.useState(predefinedDecks)
    const [deckCards, setDeckCards] = React.useState([])
    let cards = availableCardNames()


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
        }, []
    )

    /* return !isAuthenticated ? <LoginFirst/> : !user ? <LoadingProgress/> : */
    return <div className="homeContainer homeWrapper">
        <div className="homeTitle">
            <span>
                {'Welcome, ' + user?.displayName + '.'}
            </span>
        </div>

        <div className="homeDecks">
            <h1>{'Decks'}</h1>

            <DeckSelect onChange={deck => {
                fetchDeck(deck)
            }}/>

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
            <span>{'Let us know how you like the newest cards:'}</span>
            <div className="homeCardsSection">
                <div/>
                {cards.slice(start, start + 2).filter(x => x).map(x =>
                    getImg(x, true)
                )}
                <div/>
            </div>

            {/* preload next page */
                cards.slice(start + 2, start + 4).filter(x => x).map(x =>
                    getImg(x, false, 0)
                )}

            <div className="homeNextPrev">
                <IconButton size="large" color="info" onClick={() => setStart(start - 1)}>
                    <SkipPrevious fontSize="large"/>
                </IconButton>
                <IconButton size="large" color="info" onClick={() => setStart(start + 1)}>
                    <SkipNext fontSize="large"/>
                </IconButton>
            </div>
            {/*<pre style={{fontSize: "50%"}}>
                user: {user?.email}<br/>
                emailVerified: {user?.emailVerified.toString()}
            </pre>*/}
        </div>

        <div className="homeCommunity">
                    <span>
                        <Button href="https://discord.gg/gyjZ9Fbkbm"
                                color="info" target="_blank" rel="noreferrer">
                            {'Join the Community'}
                        </Button>
                    </span>
        </div>
    </div>
}

export default function HomePage() {
    return (
        <Layout title={gameName("Beta")} noCss gameCss mui noModeToggle>
            <HohApiWrapper>
                <HomeLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
