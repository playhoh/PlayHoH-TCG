import {Layout} from "../components/Layout"
import React from "react"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"
import {baseGameName, gameName} from "../components/constants"
import {LoadingProgress} from "../components/LoadingProgress"
import {hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {parseUrlParams} from "../src/utils"

export default function CardsPage() {
    const seasonId = () => {
        let date = new Date()
        return date.toISOString().substring(0, 7)
    }

    const [cards, setCards] = React.useState([])
    const {admin} = parseUrlParams()
    React.useEffect(() => {
        /*moralisSetup()

        function getItems(className, withRes) {
            let query = new Moralis.Query(Moralis.Object.extend(className))
            query.exists("key")
            // query.startsWith("key", "#")
            // query.exists("cardData")
            query.exists("data.wikitext")
            // query.doesNotExist("creator")
            query.exists("img")
            query.find().then(x => {
                let filter = x.map(x => JSON.parse(JSON.stringify(x)))
                withRes(filter)
            })
        }

        getItems("WikiPerson", f => {
            setCards(f)
            getItems("WikiObject", f2 => {
                setCards([...f, ...f2])
            })
        })*/
        fetch("/api/cards/newest").then(x => x.json()).then(setCards)
    }, [])

    return (
        <Layout title={gameName("Cards")} mui>
            <h1 id="text01">{baseGameName}</h1>
            <div className="textPara">{'New cards this season ' + seasonId()} {admin && "Click to Edit."}</div>
            <div className="textPara">
                <div className="images">
                    {!cards ? <LoadingProgress/>
                        : cards.map((x, i) => {
                            let img = <img key={x.key}
                                           src={imgUrlForName(x.key?.replace('#', ""))}
                                           alt=""
                                           height={hiresCardHeight / 2}
                                           width={hiresCardWidth / 2}
                            />
                            return admin ?
                                <a key={x.key}
                                   href={"/admin?q=" + decodeURIComponent(x.id)
                                       + (x.typeLine.includes("Object") ? "&o=1" : "")}>{img}</a>
                                : img
                            {/*<div className="flip-card" key={x}>
                                                    <div className="flip-card-inner">
                                                        <div className="flip-card-front">
                                                            <img src={imgUrlForName(x.key?.replace('#', ""))}
                                                                 alt="Card 2"/>
                                                        </div>
                                                        <div className="flip-card-back">
                                                            <img src="https://i.imgur.com/5wutLhx.png" alt="Card 1"/>
                                                        </div>
                                                    </div>
                                                </div>*/
                            }
                        })}
                </div>
            </div>
        </Layout>
    )
}
