import React from "react"
import {Layout} from "../components/Layout"
import {gameName} from "../components/constants"
import {parseUrlParams} from "../src/utils"
import {availableCardNames} from "../src/cardData"
import {LoadingProgress} from "../components/LoadingProgress"
import {useUser} from "../src/client/userApi"
import {voteFunction} from "../src/client/cardApi"
import {randomGenTime} from "../src/polygen"
import {HohApiWrapper} from "../src/client/clientApi"
import {VoteComponent, VoteComponentAdditionalHead} from "../components/VoteComponent"

function VotingLogic() {
    const [cards, setCards] = React.useState([])

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
                    })).sort(() => r() - r())),
                1300) // fake loading time
        } else {
            Promise.all([
                fetch("/api/cards/all").then(x => x.json()),
                !user ? Promise.resolve() : fetch("/api/votes/" + user?.username).then(x => x.json())
            ]).then(([cardsFromServer, votes]) => {
                    let shuffled = cardsFromServer
                        .filter(card => votes === undefined || !votes.find(vote => vote.name === card.name))
                        .sort(() => r() - r())
                    setCards(shuffled)
                }
            )
        }
    }, [])

    const {user, isAuthenticated} = useUser()
    const vote = voteFunction(user)

    function voteItem(item, delta) {
        let card = {...item, img: undefined}
        console.log(delta + ' for image ' + item.key + ": " + JSON.stringify(card))
        user && vote(card.name, delta)
    }

    return (
        <>
            <VoteComponent voteItem={voteItem} cardsData={cards}/>
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
                moreHead={VoteComponentAdditionalHead}>
            {!(typeof window) ? "" : <VotingLogic/>}
        </Layout>
    </HohApiWrapper>
}