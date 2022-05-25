import React, {useEffect} from 'react'
import Layout from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {useUser} from "../src/client/userApi"
import {LoadingProgress} from "../components/LoadingProgress"
import {LoginFirst} from "../components/LoginFirst"
import {gameName} from "../components/constants"
import {Badge, Button, IconButton, Typography} from "@mui/material"
import {FavoriteOutlined, SkipNext, SkipPrevious, ThumbDown} from "@mui/icons-material"
import {availableCardNames, cardImgUrlForName} from "../src/cardData"
import {debug} from "../src/utils"
import {SimpleTooltip} from "../components/SimpleTooltip"

let resourceSymbol = <>&#x24C7;</>
let phys2Symbol = <>&#x1F441;</>
let physSymbol = <>&#x270A;</>
let witsSymbol = <>&#x233E;</>
let height = 444


function vote(name: string, delta: number) {
    debug("vote", name, delta)
}

function HomeLogic() {
    const {user, userPointer, isAuthenticated} = useUser()
    const [start, setStart] = React.useState(0)
    const [deckCards, setDeckCards] = React.useState([])
    let cards = availableCardNames()

    function getImg(name: string, voting?: boolean, heightOverride?: number, style?: any) {
        let img = <img src={cardImgUrlForName(name, true)}
                       height={heightOverride === undefined ? height : heightOverride}
                       alt="" style={style || {}}/>
        return !voting ? img : <div key={name}>
            <Badge anchorOrigin={{vertical: "bottom", horizontal: "left"}}
                   badgeContent={<IconButton color="info" onClick={() => vote(name, -1)}>
                       <ThumbDown/>
                   </IconButton>}>
                <Badge anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                       badgeContent={<IconButton color="error" onClick={() => vote(name, +1)}>
                           <FavoriteOutlined/>
                       </IconButton>}>
                    {img}
                </Badge>
            </Badge>
        </div>
    }

    useEffect(() => {
            fetch("/api/tutorial").then(x => x.json()).then(beta1Json => {
                setDeckCards(beta1Json)
            })
        }, []
    )

    return !isAuthenticated
        ? <LoginFirst/>
        : user
            ? <div className="homeContainer homeWrapper">
                <div className="homeTitle">
                    <Typography>
                        {'Welcome, ' + user.displayName + '.'}
                    </Typography>
                </div>

                <div className="homeDecks">
                    <Typography>{'homeDecks'}</Typography>
                    {deckCards.map((x, i) =>
                        <SimpleTooltip title={getImg(x.name, false, undefined, {marginLeft: -122})} placement="left">
                            <div className="homeDeckCard" key={i}>
                            <span className="homeDeckCardName">
                                {x.name}
                            </span>
                                <span className="homeDeckCardCost">
                                {Array.from({length: x.cost}).map(() => resourceSymbol)}
                            </span>
                            </div>
                        </SimpleTooltip>
                    )}
                </div>

                <div className="homeMain">
                    <Typography>{'Let us know how you like the newest cards:'}</Typography>
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
                        <IconButton color="info" onClick={() => setStart(start - 1)}>
                            <SkipPrevious/>
                        </IconButton>
                        <IconButton color="info" onClick={() => setStart(start + 1)}>
                            <SkipNext/>
                        </IconButton>
                    </div>
                    <pre style={{fontSize: "50%"}}>
                        user: {user.email}<br/>
                        emailVerified: {user.emailVerified.toString()}
                    </pre>

                </div>

                <div className="homeCommunity">
                    <Typography>
                        <Button href="https://discord.gg/gyjZ9Fbkbm"
                                color="info" target="_blank" rel="noreferrer">
                            {'Join the Community'}
                        </Button>
                    </Typography>
                </div>
            </div>
            : <LoadingProgress/>
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
