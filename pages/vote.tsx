import React from "react"
import {Layout} from "../components/Layout"
import {gameName} from "../components/constants"
import {debug, parseUrlParams} from "../src/utils"
import {availableCardNames, hiddenCardPath, hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {LoadingProgress} from "../components/LoadingProgress"
import {useUser} from "../src/client/userApi"
import {voteFunction} from "../src/client/cardApi"
import {randomGenTime} from "../src/polygen"
import {HohApiWrapper} from "../src/client/clientApi"
import useWindowDimensions from "../src/client/useWindowSize"

function VotingLogic() {
    const [cards, setCards] = React.useState([])
    const [end, setEnd] = React.useState(4)

    const {factor, OFFLINE} = parseUrlParams()
    const factorFromUrl = parseFloat(factor) || 1

    React.useEffect(() => {
        const r = randomGenTime()
        if (OFFLINE) {
            setTimeout(() =>
                    setCards(availableCardNames().map(x => ({
                        name: x,
                        displayName: x,
                        key: "../../static/img/" + x.replace(/ /g, "_") + ".jpg"
                    })).sort(() => r())),
                1300) // fake loading time
        } else {
            Promise.all([
                fetch("/api/cards/all").then(x => x.json()),
                !user ? Promise.resolve() : fetch("/api/votes/" + user?.username).then(x => x.json())
            ]).then(([cardsFromServer, votes]) => {
                    let shuffled = cardsFromServer
                        .filter(card => votes === undefined || !votes.find(vote => vote.name === card.name))
                        .sort(() => r())
                    setCards(shuffled)
                }
            )
        }
    }, [])

    const containerRef = React.useRef()
    const {current} = containerRef
    const {user, isAuthenticated} = useUser()
    const vote = voteFunction(user)

    const {height, width} = useWindowDimensions()

    function voteItem(item, delta) {
        setEnd(old => old + 1)
        let card = {...item, img: undefined}
        console.log(delta + ' for image ' + item.key + ": " + JSON.stringify(card))
        user && vote(card.name, delta)
    }

    // https://github.com/do-web/jTinder
    let jTinder = global["$"]?.call("#tinderslide")?.jTinder
    React.useEffect(() => {
        if (current && jTinder && cards?.length > 0) {
            const jq = global["$"]
            debug("jq", jq)
            const selected = jq("#tinderslide")
            debug("jq selected", selected)
            const res = selected.jTinder({
                onDislike: function (item) {
                    voteItem(cards[item.index()], -1)
                },
                onLike: function (item) {
                    voteItem(cards[item.index()], 1)

                },
                animationRevertSpeed: 200,
                animationSpeed: 400,
                threshold: 1,
                likeSelector: '.like',
                dislikeSelector: '.dislike'
            })
            debug("jTinder call done", res)
        }
    }, [current && jTinder, cards?.length])

    const f2 = height / hiresCardHeight * 0.66
    const cardWidth = hiresCardWidth * f2 * factorFromUrl
    const cardHeight = hiresCardHeight * f2 * factorFromUrl
    const marginLeft = width * 0.1

    return (
        <>
            <div id="tinderslide" ref={containerRef} style={{opacity: cards ? 1 : 0.1, marginLeft}}>
                <ul>{cards.map((x, i) => {
                    const info = "" // "#" + i + "|" + (cards.length - end) + "|" + end
                    const url = i > cards.length - end
                        ? "/api/img/" + x.key?.replace('#', "")
                        : hiddenCardPath
                    return <li key={x.key + "_" + i}
                               className="pane"
                               style={{height: height * 0.8, width: width * 0.8}}>

                        <img src={url} width={cardWidth} height={cardHeight} alt={x.displayName}/>
                        {/*

                        <div className="img"
                             style={{
                                 background: "url('" + url + "') no-repeat scroll center center",
                                 backgroundSize: cardWidth + "px " + cardHeight + "px"
                             }}>
                        </div>
                        <div>
                            {x.displayName} <small>{info}</small> {!isAuthenticated && " (Login to store your vote)"}
                        </div>*/}
                        <div className="like"></div>
                        <div className="dislike"></div>
                    </li>
                })}
                </ul>
            </div>

            {cards.length === 0 && <LoadingProgress/>}
            {<h2 style={{color: "#fff"}}>
                {
                    cards.length === 0 ? "Loading..." : "" // "w" + width + "h" + height
                }
                {!isAuthenticated && " (Login to store your vote)"}
            </h2>}
        </>
    )
}

export default function VotingPage() {
    return <HohApiWrapper>
        <Layout title={gameName("Vote")} noCss mui
                moreHead={<>
                    <link rel="stylesheet" type="text/css" href="./jtinder/jTinder.css"/>
                    <script type="text/javascript" src="./jtinder/jquery.jTinder.withDependencies.js"></script>
                    <style>
                        {`body {
                            background: black;
                        }`}
                    </style>
                </>
                }>
            {!(typeof window) ? "" : <VotingLogic/>}
        </Layout>
    </HohApiWrapper>
}