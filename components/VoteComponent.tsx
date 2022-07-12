import React from "react"
import {debug, parseUrlParams} from "../src/utils"
import {hiddenCardPath, hiresCardHeight, hiresCardWidth} from "../src/cardData"
import useWindowDimensions from "../src/client/useWindowSize"
import {Card} from "../interfaces/cardTypes"

export type VoteComponentProps = {
    cardsData: Card[],
    scaling?: number,
    voteItem: (card: Card, delta: number) => void
}

export const VoteComponentAdditionalHead = [
    <link rel="stylesheet" type="text/css" href="./jtinder/jTinder.css"/>,
    <script type="text/javascript" src="./jtinder/jquery.jTinder.withDependencies.js"></script>,
    <style>
        {`body {
                background: black;
            }`}
    </style>
]

export function VoteComponent({cardsData, voteItem, scaling}: VoteComponentProps) {
    const [end, setEnd] = React.useState(4)

    const {factor, OFFLINE} = parseUrlParams()
    const factorFromUrl = parseFloat(factor) || scaling || 1

    const containerRef = React.useRef()
    const {current} = containerRef

    const {height, width} = useWindowDimensions()

    // https://github.com/do-web/jTinder
    let jTinder = global["$"]?.call("#tinderslide")?.jTinder
    React.useEffect(() => {
        if (current && jTinder && cardsData?.length > 0) {
            const jq = global["$"]
            debug("jq", jq)
            const selected = jq("#tinderslide")
            debug("jq selected", selected)
            const res = selected.jTinder({
                onDislike: function (item) {
                    setEnd(old => old + 1)
                    voteItem(cardsData[item.index()], -1)
                },
                onLike: function (item) {
                    setEnd(old => old + 1)
                    voteItem(cardsData[item.index()], 1)

                },
                animationRevertSpeed: 200,
                animationSpeed: 400,
                threshold: 1,
                likeSelector: '.like',
                dislikeSelector: '.dislike'
            })
            debug("jTinder call done", res)
        }
    }, [current && jTinder, cardsData?.length])

    const f2 = height / hiresCardHeight * 0.7
    const cardWidth = hiresCardWidth * f2 * factorFromUrl
    const cardHeight = hiresCardHeight * f2 * factorFromUrl
    const marginLeft = width * 0.1

    return (
        <>
            <div id="tinderslide" ref={containerRef} style={{opacity: cardsData ? 1 : 0.1, marginLeft}}>
                <ul>{cardsData.map((x, i) => {
                    // const info = "" // "#" + i + "|" + (cardsData.length - end) + "|" + end
                    const url = i > cardsData.length - end
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

            {/*cardsData.length === 0 && <LoadingProgress/>}
            {<h2 style={{color: "#fff"}}>
                {
                    cardsData.length === 0 ? "Loading..." : "" // "w" + width + "h" + height
                }
                {!isAuthenticated && " (Login to store your vote)"}
            </h2>*/}
        </>
    )
}
