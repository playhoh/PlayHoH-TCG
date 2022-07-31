import React, {useEffect} from 'react'
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/clientApi"
import {capitalize, debug, repeat, shuffle} from "../src/utils"
import {logOut, useUser} from "../src/client/userApi"
import {baseGameNameShort, gameName, TRIGGER_SECRET_KEY} from "../components/constants"
import {Button as Btn, CircularProgress, IconButton} from "@mui/material"
import {AttachMoney, FavoriteOutlined, Logout, Settings, Star, ThumbDown} from "@mui/icons-material"
import {hiddenCardPath, hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {SimpleTooltip} from "../components/SimpleTooltip"
import {DeckSelect} from "../components/DeckSelect"
import {LoginFirst} from "../components/LoginFirst"
import {LoadingProgress} from "../components/LoadingProgress"
import {JoinDiscord} from "../components/JoinDiscord"
import {OptionsPanel} from '../components/OptionsPanel'
import useWindowDimensions from "../src/client/useWindowSize"
import {voteFunction} from '../src/client/cardApi'
import {Card} from "../interfaces/cardTypes"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"
import {SimpleBadge} from '../components/SimpleBadge'

const fontSize = "2vh"
const Button = props => <Btn labelStyle={{fontSize}} {...props}/>

export function HomeLogic() {
    const {user, userPointer, isAuthenticated} = useUser()
    const [start, setStart] = React.useState(0)
    //const [allDecks, setAllDecks] = React.useState(predefinedDecks)
    const [deckCards, setDeckCards] = React.useState<Card[]>([])
    //const [badWords, setBadWords] = React.useState([])
    const [cards, setCards] = React.useState<any[]>([])

    //const [newestCards, setNewestCards] = React.useState([])

    const {height, width} = useWindowDimensions()

    const f2 = height / hiresCardHeight / 4.8
    const cardHeight = hiresCardHeight * f2

    const vote = voteFunction(user,
        name => setCards(cards.filter(x => x.name !== name)))

    function getImg(card: Card, voting?: boolean, heightOverride?: number, style?: any, oldMethod?: boolean) {
        const lastPart = oldMethod
            ? encodeURIComponent(card.name)
            : card.key?.replace(/#/g, "") || "no key for " + card.name
        let actualHeight = heightOverride === undefined ? cardHeight * 2.2 : heightOverride
        const img = <img src={lastPart ? imgUrlForName(lastPart, oldMethod) : hiddenCardPath}
                         height={actualHeight}
                         width={Math.floor(actualHeight / hiresCardHeight * hiresCardWidth)}
                         alt="" style={style || {}}/>

        return (!voting || !lastPart) ? img : <div key={lastPart} style={style || {}}>
            <SimpleBadge left badgeContent={<IconButton color="info" onClick={() => vote(card.name, -1)}>
                <ThumbDown fontSize="large"/>
            </IconButton>}>
                <SimpleBadge badgeContent={<IconButton color="error" onClick={() => vote(card.name, +1)}>
                    <FavoriteOutlined fontSize="large"/>
                </IconButton>}>
                    {img}
                </SimpleBadge>
            </SimpleBadge>
        </div>
    }

    /*function handleError(err) {
        setMessage(err?.error || JSON.stringify(err))
    }*/

    function fetchDeck(id) {
        fetch("/api/decks/" + id).then(x => x.json()).then(deckObj => {
            deckObj?.deck && setDeckCards(deckObj.deck)
        })
    }

    useEffect(() => {
            /*fetch("/api/allDecks").then(x => x.json()).then(allDecksValue => {
                allDecksValue && setAllDecks(allDecksValue)
            })*/

            fetchDeck(user?.deck || "beta1")

            //fetch("/api/badWords").then(x => x.json()).then(setBadWords)

            user && fetch("/api/cards/random").then(x => x.json()).then(cards => {
                //setNewestCards(cards)
                debug("random cards", cards)

                const cardsSection = shuffle(cards).slice(0, 40)
                fetch("/api/votes/" + user?.username).then(x => x.json()).then(votes => {
                    setCards(cardsSection.filter(x => !votes.find(y => y.name === x)))
                })
            })
        }, []
    )

    const [loggingOut, setLoggingOut] = React.useState(false)
    const [showingOptions, setShowingOptions] = React.useState(false)
    const [mainTab, setMainTab] = React.useState(true)
    const [bought, setBought] = React.useState(-1)
    const [message, setMessage] = React.useState("")
    //const [fontSize, setfontSize] = React.useState("")

    const props = {user, userPointer, setShowingOptions}
    debug("userPointer", userPointer, "us", user)

    const SwitchTab = () => <div style={{
        display: "flex", justifyContent: "space-between"
    }}>
        <h1 onClick={() => setMainTab(true)}
            style={{cursor: "pointer", textDecoration: mainTab ? "underline" : undefined}}>
            {/*opacity: !mainTab ? 0.5 : 1*/}
            {'Browse Latest Cards'}<Star/>
        </h1>

        <h1 onClick={() => setMainTab(false)}
            style={{cursor: "pointer", textDecoration: !mainTab ? "underline" : undefined}}>
            {'Get New Cards'}<AttachMoney/>
        </h1>
    </div>

    const showPackSize = 6
    const packSize = 15
    const prevHeight = 170
    const prevWidth = Math.floor(prevHeight / hiresCardHeight * hiresCardWidth)

    function buyPack() {
        setBought(-2)
        setTimeout(() => {
            setBought(0)
            let interval = undefined
            interval = setInterval(() => {
                setBought(prev => {
                    if (prev < packSize)
                        return prev + 1
                    else {
                        clearInterval(interval)
                        return prev
                    }
                })
            }, 200)
        }, 1000)
    }

    let isRevealingMore = bought > showPackSize
    let showLen = isRevealingMore ? packSize : showPackSize

    //const [value, setValue] = React.useState(1)
    //const handleChange = (event, newValue) => setValue(newValue)

    const MainContent = () =>
        mainTab
            ? <div>
                <SwitchTab/>
                <span>{'Let us know how you like these:'}</span>

                {/*
                <Box sx={{width: 200}}>
                    <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                        <Slider step={0.05} valueLabelDisplay="auto"
                                aria-label="small" min={0.1} max={2} value={value}
                                onChange={handleChange}/>
                    </Stack>
                </Box>
                */}

                <div className="homeCardsSection">
                    {cards.length === 0 ? <CircularProgress/> :
                        cards.filter(x => x)
                            //.slice(start, start + 2)
                            .map(x => getImg(x, true, undefined, {margin: 20}))
                        //<VoteComponent cardsData={cards} voteItem={console.log} scaling={value}/>
                    }
                </div>

                {/*<div className="homeNextPrev">
                    <IconButton disabled={start === 0} size="large" color="info" onClick={() => setStart(start - 1)}>
                        <SkipPrevious fontSize="large"/>
                    </IconButton>
                    <IconButton disabled={start >= cards.length - 2} size="large" color="info"
                                onClick={() => setStart(start + 1)}>
                        <SkipNext fontSize="large"/>
                    </IconButton>
                </div>*/}
            </div>
            : <div>
                <SwitchTab/>
                <span>{/*'Buy a pack of ' + packSize + ' cards and play!'*/}</span>

                <br/>
                <br/>
                <Button
                    variant="outlined" href="https://rarible.com/PlayHoH/sale" color="primary"
                    target="_blank" rel="noreferrer">
                    {'Buy HoH cards on Rarible'}
                </Button>

                {/*
                <TextField value={fontSize} onChange={x => setfontSize(x.target.value)}/>
                */}

                {/*bought === -2 ?
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <CircularProgress/>
                    </div>
                    :
                    <div className="homeCardsSection" style={{flexWrap: "wrap"}}>
                        {repeat(showLen, "").map((x, i) => {
                                const scale = bought < i ? 0.4 : 0.8
                                return <div key={"r" + i} style={{
                                    opacity: i == showLen - 1 && showLen !== packSize ? 0.5 : 1,
                                    transformOrigin: "bottom center",
                                    // marginLeft: -14,
                                    transform: "scale(" + scale + ")",
                                    // isRevealingMore ? ... : "scale(" + scale + ") rotate(" + lerp(-15, 15, (i + 1) / (showLen + 1)) + "deg)",
                                    backgroundImage: 'url("' + hiddenCardPath + '")',
                                    backgroundSize: prevWidth + "px " + prevHeight + "px",
                                    height: prevHeight,
                                    width: prevWidth
                                }}/>
                            }
                        )}
                    </div>
                */}

                <div style={{display: "flex", justifyContent: "center"}}>
                    {/*bought >= packSize ?
                        <Button onClick={() => setBought(-1)}
                                variant="outlined" color="info">
                            {'OK'}
                        </Button>
                        :
                        bought === -1 && <Button
                            onClick={() => buyPack()}
                            variant="outlined" color="info">
                            {'Buy'}
                        </Button>*/}
                </div>
            </div>

    const scrollY: any = {overflowY: "overlay", overflowX: "hidden"} // height < 900 ? ... : undefined

    return loggingOut ? <LoadingProgress/> : !isAuthenticated ? <LoginFirst/> : !user ? <LoadingProgress/> :
        <div className="homeContainer homeWrapper" style={{fontSize}}>
            <div className="homeTitle">
                <h1>
                    {'Welcome to ' + baseGameNameShort + ', ' + capitalize(user?.displayName) + '.'}
                </h1>
                <div>{message}</div>
                {user.isAdmin && <div>
                    <Button variant="outlined" size="large" color="info"
                            href="/admin">
                        {'Admin'}
                    </Button>
                    <Button variant="outlined" size="large" color="info" href="/mint">
                        {'Minter'}
                    </Button>
                    <Button variant="outlined" size="large" color="info" href="/new?admin=1">
                        {'New'}
                    </Button>
                    <Button variant="outlined" size="large" color="info"
                            href={"/api/trigger/" + TRIGGER_SECRET_KEY()}>
                        {'Trigger'}
                    </Button>
                    {/*badWords && <div>
                        <TextField value={message} onChange={x => setMessage(x.target.value)}/>
                        <br/>
                        ID for {message} is {getId(parseFloat(message), badWords)}
                    </div>*/}
                </div>}
            </div>
            <div className="homeOptions">
                <Button disabled={loggingOut} size="large" color="info" onClick={() => {
                    setShowingOptions(!showingOptions)
                }}>
                    <Settings fontSize="large"/> {'Options'}
                </Button>

                <Button disabled={loggingOut} size="large" color="info" onClick={() => {
                    setLoggingOut(true)
                    logOut(() => {
                        window.location.href = "/start"
                    })
                }}>
                    <Logout fontSize="large"/> {'Log out'}
                </Button>
            </div>

            <div className="homeDecks rightBoxBg" style={scrollY}>
                {showingOptions ? <OptionsPanel {...props}/> :
                    <>
                        <h1>{'Constructed Decks'}</h1>

                        <DeckSelect onChange={deck => fetchDeck(deck)}/>

                        <div style={{height: 20}}/>

                        {deckCards?.map((x, i) =>
                            <SimpleTooltip
                                key={"prev" + x.name}
                                title={getImg(x, false, undefined, {marginLeft: -122}, true)}
                                placement="left">
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
                    </>}
            </div>

            <div className="homeMain">
                {
                    /* preload next page, <img> with height 0, same position, it needs to be
                    cards
                        .slice(start + 2, start + 4)
                        .filter(x => x)
                        .map(x =>
                        getImg(x, false, 0)
                    )
                    */
                }
            </div>

            <div className="homeMain leftBoxBg" style={scrollY}>
                <MainContent/>
            </div>

            <div className="homeCommunity">
                <JoinDiscord simple/>
            </div>

            <div className="homeActions">
                <Button variant="contained" size="large" color="info" href="/solo">
                    {'Learn how to play'}
                </Button>

                <Button variant="contained" size="large" color="primary" href="/now">
                    {'Challenge another player'}
                </Button>
            </div>
        </div>
}

export default function HomePage() {
    /*moreHead={VoteComponentAdditionalHead}*/
    return (
        <Layout title={gameName("Home")} noCss gameCss mui>
            <HohApiWrapper>
                <HomeLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
