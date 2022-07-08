import React from "react"
import {Layout} from "../components/Layout"
import {gameName} from "../components/constants"
import {debug} from "../src/utils"
import {hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {LoadingProgress} from "../components/LoadingProgress"
import {useUser} from "../src/client/userApi"
import {voteFunction} from "../src/client/cardApi"
import {randomGenTime} from "../src/polygen"
import {HohApiWrapper} from "../src/client/clientApi"

function VotingLogic() {
    const [cards, setCards] = React.useState([])
    /*[{
    key: "#85W2LN",
    name: "Ziyad ibn Abihi",
    displayName: "Ziyad ibn Abihi"
    }])*/
    // const {admin} = parseUrlParams()
    React.useEffect(() => {
        const r = randomGenTime()
        fetch("/api/cards/all").then(x => x.json()).then(x => {
            let sort = x.sort(() => r())
            setCards(sort)
        })
    }, [])
    // const url = "https://i.stack.imgur.com/HAQnl.png"

    const containerRef = React.useRef()
    const {current} = containerRef
    const {user, isAuthenticated} = useUser()
    const vote = voteFunction(user)

    function voteItem(item, delta) {
        let card = {...item, img: undefined}
        console.log(delta + ' for image ' + item.key + ": " + JSON.stringify(card))
        user && vote(card.name, delta)
    }

    React.useEffect(() => {
        if (current && global["$"] && global["$"]?.call("#tinderslide")?.jTinder && cards?.length > 0) {
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
    }, [current, global["$"], global["$"]?.call("#tinderslide")?.jTinder, cards?.length])

    return (
        <Layout title={gameName("Vote")} noCss
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

            {!cards ? <LoadingProgress/>
                : <div id="tinderslide" ref={containerRef}>
                    <ul>{cards.map((x, i) => {
                        const url = "/api/img/" + x.key?.replace('#', "")
                        return <li key={x.key + "_" + i}
                                   className="pane"
                                   style={{height: hiresCardHeight * 0.9, width: hiresCardWidth * 0.9}}>
                            <div className="img"
                                 style={{
                                     background: "url('" + url + "') no-repeat scroll center center",
                                     backgroundSize: (hiresCardHeight * 0.8) + "px " + (hiresCardWidth * 0.8) + "px"
                                 }}>
                            </div>
                            <div>{x.displayName} {!isAuthenticated && " (Login to store your vote)"}</div>
                            <div className="like"></div>
                            <div className="dislike"></div>
                        </li>
                    })}
                    </ul>
                </div>}
        </Layout>
    )
}

export default function VotingPage() {
    return <HohApiWrapper>
        <VotingLogic/>
    </HohApiWrapper>
}