import {Layout} from "../components/Layout"
import React from "react"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"
import {baseGameName, gameName} from "../components/constants"
import {LoadingProgress} from "../components/LoadingProgress"
import {Moralis} from "moralis"
import {moralisSetup} from "../src/client/baseApi"
import {hiresCardHeight, hiresCardWidth} from "../src/cardData"

export default function CardsPage() {
    const seasonId = () => {
        let date = new Date()
        return date.toISOString().substring(0, 7)
    }

    const [cards, setCards] = React.useState([])
    React.useEffect(() => {
        moralisSetup()

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
        })
    }, [])

    return (
        <Layout title={gameName("Cards")} mui>
            <div className="fade-in-image">
                <div className="wrapper">
                    <div className="main">
                        <div className="inner icons">
                            <h1 id="text01">{baseGameName}</h1>
                            <p className="textPara">{'New cards this season ' + seasonId()}</p>
                            <p className="textPara">
                                <div className="images">
                                    {!cards ? <LoadingProgress/>
                                        : cards.map((x, i) => {
                                            return <img key={x.key}
                                                        src={imgUrlForName(x.key?.replace('#', ""))}
                                                        alt=""
                                                        height={hiresCardHeight / 2}
                                                        width={hiresCardWidth / 2}
                                            />
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
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
