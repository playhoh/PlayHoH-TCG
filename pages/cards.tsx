import {Layout} from "../components/Layout"
import React from "react"
import {imgUrlForName} from "../components/AtlassianDragAndDrop"
import {baseGameName, gameName} from "../components/constants"
import {availableCardNames} from "../src/cardData"

export default function CardsPage() {
    return (
        <Layout title={gameName("Test Cards")}>
            <div className="fade-in-image">
                <div className="wrapper">
                    <div className="main">
                        <div className="inner icons">
                            <h1 id="text01">{baseGameName}</h1>
                            <p className="textPara">{'Some Test cards'}</p>
                            <p className="textPara">
                                <div className="images">
                                    {availableCardNames()
                                        .map((x, i) => {
                                            return <div className="flip-card" key={x}>
                                                <div className="flip-card-inner">
                                                    <div className="flip-card-front">
                                                        <img src={imgUrlForName(x)} alt="Card 2"/>
                                                    </div>
                                                    <div className="flip-card-back">
                                                        <img src="https://i.imgur.com/5wutLhx.png" alt="Card 1"/>
                                                    </div>
                                                </div>
                                            </div>
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
