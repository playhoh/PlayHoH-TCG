import React, {useEffect} from 'react'
import {Button, Switch, TextField} from "@mui/material"
import {Moralis} from "moralis"
import {HohApiWrapper} from "../src/client/baseApi"
import {currentUser} from "../src/client/userApi"
import {LoadingProgress} from "../components/LoadingProgress"
import {LoginFirst} from "../components/LoginFirst"
import {extractCategoriesFromWikitext, parseWikiText} from "../src/wikiApi"
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "../src/effectsApi"
import {gameName} from "../components/constants"
import {cardImgUrlForName} from '../src/cardData'
import {AdminTable} from "../components/AdminTable"
import {Layout} from "../components/Layout"

function WikiLogic() {
    const [user, setUser] = React.useState(undefined)
    const [needsAuth, setNeedsAuth] = React.useState(false)
    const [text, setText] = React.useState("Pompeii")
    const [status, setStatus] = React.useState("")
    const [isPerson, setPerson] = React.useState(false)
    const [effectsData, setEffectsData] = React.useState(undefined)
    const [results, setResults] = React.useState([])

    useEffect(() => {
        currentUser(setUser, setNeedsAuth)
        fetch("/api/effects").then(x => x.json()).then(x => {
            setEffectsData(x)
        })
    }, [])


    function getFromDb(isPerson: boolean, text: string, cont) {
        const WikiPerson = Moralis.Object.extend("WikiPerson")
        const WikiObject = Moralis.Object.extend("WikiObject")
        const classObj = isPerson ? WikiPerson : WikiObject
        const query = new Moralis.Query(classObj)
        query.exists("data")
        query.exists("data.img")
        query.notEqualTo("data.img", "")
        query.contains("name", text)
        //query.contains("data.category", text)
        query.find()
            .then(res =>
                cont(res.map(x => {
                    const name = x.get('name')
                    const data = x.get('data')
                    return {name, data}
                })))
    }

    function click() {
        if (!effectsData)
            return

        setStatus("loading...")

        getFromDb(isPerson, text, res => {

            setStatus("found: " + res.length)

            setResults(res.map(x => {
                const dataParsed = {
                    ...parseWikiText(x.name, isPerson, x.data.wikitext, x.data.category),
                    img: x.data.img
                }

                const category = dataParsed.category || extractCategoriesFromWikitext(x.data.wikitext)
                let effects = undefined
                dataParsed.typeLine?.split(" ").forEach(part => {
                    if (!effects?.length)
                        effects = getRelevantEffectsFor(effectsData)(part)
                })
                if (!effects?.length) {
                    effects = getRelevantEffectsForObjectCategory(effectsData)(category)
                }
                return ({
                    name: x.name,
                    data: {
                        ...dataParsed,
                        typeLine: dataParsed.typeLine || category,
                        foundEffectCategory: effects && effects[0]?.category,
                        category,
                    },
                    img: dataParsed.img,
                    effects: effects?.map(x => x.text)
                })
            }))
        })

    }

    return (
        needsAuth
            ? <LoginFirst/>
            : user
                ? <div>
                    <TextField fullWidth autoFocus
                               value={text} onChange={x => setText(x.target.value)}
                               onKeyDown={x => x.key === 'Enter' && click()} placeholder="Category name or part"/>
                    <br/>

                    <Button onClick={click} disabled={!effectsData}>
                        Fetch
                    </Button>
                    | isPerson:
                    <Switch onChange={(x, checked) => setPerson(checked)} checked={isPerson}/>
                    | {status} {effectsData ? "" : "..."}

                    <AdminTable header="Results"
                                rows={results} cols={["img", "name", "data", "effects"]}
                                imgCol="img"
                                customCol="data" customColFunction={data =>
                        <>
                            <img src={cardImgUrlForName(data.name)} height="300" alt="" style={{float: "left"}}/>
                            <div style={{marginLeft: 4}}>
                                typeLine: {data.typeLine}
                                <br/>
                                category: {data.category}
                                <br/>
                                foundEffectCategory: {data.foundEffectCategory}
                                <br/>
                                year: {data.year}
                                <br/>
                                {/*onMouseEnter={()=>showDetails(data.name)} onMouseLeave={()=>showDetails(data.name)}*/}

                                <div title={data?.wikitext || ""}>
                                    wikitext: {data?.wikitext?.split("\n")[0]}...
                                </div>
                            </div>
                        </>
                    }/>

                </div>
                : <LoadingProgress/>
    )
}

export default function WikiPage() {
    return (
        <Layout title={gameName("Explore")} noCss mui>
            <HohApiWrapper>
                <WikiLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
