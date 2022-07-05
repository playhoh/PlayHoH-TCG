import {Layout} from "../components/Layout"
import React from "react"
import {baseGameName, gameName} from "../components/constants"
import {LoadingProgress} from "../components/LoadingProgress"
import {hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {parseUrlParams} from "../src/utils"

export default function AllCardsPage() {
    const seasonId = () => {
        let date = new Date()
        return date.toISOString().substring(0, 7)
    }

    const [cards, setCards] = React.useState([])
    const {admin} = parseUrlParams()
    React.useEffect(() => {
        fetch("/api/cards/all").then(x => x.json()).then(setCards)
    }, [])

    return (
        <Layout title={gameName("Cards")} mui noCss>
            <h1>{baseGameName}</h1>
            <div>{'All cards ' + seasonId()} {admin && "Click to Edit."}</div>
            <div>
                <div>
                    {!cards ? <LoadingProgress/>
                        : cards.map(x => {
                            let img = <img key={x.key}
                                           src={"/api/img/" + x.key.replace('#', '')}
                                           alt=""
                                           height={hiresCardHeight / 2}
                                           width={hiresCardWidth / 2}
                            />
                            return admin ?
                                <a key={x.key}
                                   href={"/admin?q=" + decodeURIComponent(x.id)
                                       + (x.typeLine.includes("Object") ? "&o=1" : "")}>{img}</a>
                                : img
                        })
                    }
                </div>
            </div>
        </Layout>
    )
}
