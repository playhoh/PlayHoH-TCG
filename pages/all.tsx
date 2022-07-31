import {Layout} from "../components/Layout"
import React from "react"
import {baseGameName, gameName} from "../components/constants"
import {LoadingProgress} from "../components/LoadingProgress"
import {hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {parseUrlParams} from "../src/utils"
import {Button} from "@mui/material"
import {Card} from "../interfaces/cardTypes"

const moralisUrl = (x) =>
    process.env.NEXT_PUBLIC_MORALIS_SERVER_URL.replace("2053", "2083").replace("/server", "")
    + "/apps/moralisDashboard/browser/Card?filters="
    + "%5B%7B%22field%22%3A%22key%22%2C%22constraint%22%3A%22eq%22%2C%22compareTo%22%3A%22%23"
    + x.key?.replace(/#/g, "")
    + '%22%7D%5D'

const filter = ["Person", "Object", "*"]
const categories = "ABCDEFGHIJKLMNOPQRSTUVWXYZ*".split("")

//const seasonId = () => {
//    let date = new Date()
//    return date.toISOString().substring(0, 7)
//}

export default function AllCardsPage() {
    const params = parseUrlParams()
    // const currentlyInView = params.show || 50
    const [cards, setCards] = React.useState([])
    const [currentCards, setCurrentCards] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    // const [start, setStart] = React.useState(0)
    const [category, setCategory] = React.useState("A")
    const [selectedTypeValue, setTypeValue] = React.useState("*")
    const {admin, moralisAdmin, text} = parseUrlParams()

    function filterCards(letter, type, cardsArray?: Card[]) {
        const filtered = (cardsArray || cards).filter(x =>
            (letter === "*"
                ? categories.every(z => x.displayName.charAt(0) !== z)
                : x.displayName.startsWith(letter))
            && (type === "*" || x.typeLine.startsWith(type))
        )

        return filtered
    }

    React.useEffect(() => {
        setLoading(true)
        /*
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
        */

        fetch("/api/cards/aggregate").then(x => x.json()).then(res => {
            const newList = res.filter(x => x.key) || []
            setCards(newList)
            setLoading(false)
            setCurrentCards(filterCards("A", "*", newList))
        })
    }, [])


    return (
        <Layout title={gameName("Cards")} mui noCss>
            <h1>{baseGameName} <small>{cards.length ? " (" + cards.length + " cards)" : ""}</small></h1>
            <div>{/*'All cards in ' + seasonId()} {" (" + cards.length + (loading ? " and counting" : "") + ")"} {admin && "Click to Edit."*/}</div>
            {loading ? <LoadingProgress/> : undefined}
            <div>
                Name: {categories.map(cat => {
                let inCat = filterCards(cat, selectedTypeValue)
                return <Button disabled={cat === category} onClick={() => {
                    setCurrentCards(inCat)
                    setCategory(cat)
                }}>
                    {cat} ({inCat.length})
                </Button>
            })}
            </div>
            <div>
                Type: {filter.map(typeValue => {
                let inCat = filterCards(category, typeValue)
                return <Button disabled={typeValue === selectedTypeValue} onClick={() => {
                    setCurrentCards(inCat)
                    setTypeValue(typeValue)
                }}>
                    {typeValue} ({inCat.length})
                </Button>
            })}
            </div>
            <div>
                <div>
                    {currentCards.filter(x => x).map(x => {
                        let img = <img key={x.key}
                                       src={"/api/img/" + x.key.replace('#', '')}
                                       alt={x.displayName}
                                       title={x.comment}
                                       height={hiresCardHeight / 2}
                                       width={hiresCardWidth / 2}
                        />
                        let content = text ?
                            <span style={{
                                position: "relative",
                                textAlign: "center"
                            }}>
                                {img}
                                <span style={{
                                    position: "absolute",
                                    top: "50%"
                                }}>{x.name}: {x.typeLine} ({x.flavour})</span>
                            </span>
                            : img
                        return (admin || moralisAdmin) ?
                            <a key={x.key}
                               href={
                                   moralisAdmin
                                       ? moralisUrl(x)
                                       // : "/admin?q=" + decodeURIComponent(x.id) + (x.typeLine?.includes("Object") ? "&o=1" : "")
                                       : "/editor?q=" + x.key?.replace("#", "")
                               }>{content}</a>
                            : content
                    })
                    }
                </div>
            </div>
        </Layout>
    )
}
