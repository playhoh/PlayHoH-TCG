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
    const [loading, setLoading] = React.useState(true)
    const {admin} = parseUrlParams()
    React.useEffect(() => {
        setLoading(true)

        function iter(skip, old) {
            fetch("/api/cards/all?skip=" + skip).then(x => x.json()).then(res => {
                if (res?.length > 0) {
                    const newList = [...old, ...(res.filter(x => x.key) || [])]
                    setCards(newList)
                    iter(skip + 100, newList)
                } else {
                    setLoading(false)
                }
            })
        }

        iter(0, [])
    }, [])

    return (
        <Layout title={gameName("Cards")} mui noCss>
            <h1>{baseGameName}</h1>
            <div>{'All cards in ' + seasonId()} {" (" + cards.length + (loading ? " and counting" : "") + ")"} {admin && "Click to Edit."}</div>
            {loading ? <LoadingProgress/> : undefined}
            <div>
                <div>
                    {cards.map(x => {
                        let img = <img key={x.key}
                                       src={"/api/img/" + x.key.replace('#', '')}
                                       alt=""
                                       height={hiresCardHeight / 2}
                                       width={hiresCardWidth / 2}
                        />
                        return admin ?
                            <a key={x.key}
                               href={"/admin?q=" + decodeURIComponent(x.id)
                                   + (x.typeLine?.includes("Object") ? "&o=1" : "")}>{img}</a>
                            : img
                    })
                    }
                </div>
            </div>
        </Layout>
    )
}
