import React from "react"
import {Layout} from "../components/Layout"
import {queryCards, updateWikiCard} from "../src/client/cardApi"
import {getCount, HohApiWrapper} from "../src/client/baseApi"
import {Box, Button, Chip, CircularProgress, Container} from "@mui/material"
import {AdminBar} from "../components/AdminBar"
import {AdminTable} from "../components/AdminTable"
import {currentUser, queryUsers} from "../src/client/userApi"
import {parseWikiText} from "../src/wikiApi"
import {BASE_URL, capitalize, toBase64, toSet} from "../src/utils"
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "../src/effectsApi"
import {Save} from "@mui/icons-material"
import {buildCardFromWiki} from "../src/cardCreation"
import {SimpleTooltip} from "../components/SimpleTooltip"
import {CustomAutocomplete} from "../components/CustomAutocomplete"
import {CardData} from "../interfaces/cardTypes"
import {gameName} from "../components/constants"

// const back = "https://i.imgur.com/5wutLhx.png"
const fields = ["displayName", "cost", "img", "typeLine", "text", "flavor", "wits", "phys"]

function shorten(x: string, len?: number): string {
    len = len || 50
    return x?.length > len ? x.substring(0, len) + "..." : x
}

function getChoices(effectsData, wikiData, dbItem) {
    if (!wikiData)
        return {}

    let getEffectsForType = getRelevantEffectsFor(effectsData)
    let getEffectsForTypeCategory = getRelevantEffectsForObjectCategory(effectsData)

    let eff = []
    //debug("effectsData && wikiData?.typeLines", effectsData, wikiData?.typeLines)
    if (effectsData && wikiData.typeLines) {
        Object.keys(wikiData.typeLines).forEach(key => {
            const typeLine = wikiData.typeLines[key]
            if (typeLine) {
                eff.push(...(getEffectsForType(typeLine) || []))
                eff.push(...(getEffectsForTypeCategory(typeLine) || []))
                typeLine.split(' ').forEach(part => {
                    eff.push(...(getEffectsForType(part) || []))
                    eff.push(...(getEffectsForTypeCategory(part) || []))
                })
            }
        })
        // debug("eff", eff)
    }

    return {
        flavors: wikiData.years,
        texts: toSet(eff.map(x => "Enter: " + (capitalize(x.text) + "."))),
        costs: [1, 2, 3, 4],
        witss: ["", 0, 1, 2, 3, 4],
        physs: ["", 0, 1, 2, 3, 4],
        imgs: [
            wikiData.img,
            dbItem?.img?.url,
            //pref + "/static/img/Albert_Einstein.jpg",
            BASE_URL + "/static/img/Man_in_hood.jpg",
            //pref + "/static/img/Cochise.jpg",
            BASE_URL + "/static/obj/Battery_Prototype.jpg",
            BASE_URL + "/static/obj/Fire_Ritual.jpg"
        ].filter(x => x)
    }
}

type AdminLogicState = { cards?: any[], users?: any[] }

const AdminLogic = () => {
    const [user, setUser] = React.useState(undefined)
    const [isLoggedOut, setLoggedOut] = React.useState(undefined)
    const [card, setCard] = React.useState(undefined)
    const [count, setCount] = React.useState(undefined)
    const [data, setData] = React.useState<AdminLogicState>({})
    const [queryText, setQueryText] = React.useState("")
    const [progress, setProgress] = React.useState("")
    // const [set, setSet] = React.useState("WI01")
    const [info, setInfo] = React.useState({})
    const [loading, setLoading] = React.useState(true)
    const [isPerson, setPerson] = React.useState(true)
    const [badWords, setBadWords] = React.useState([])
    const [fixes, setFixes] = React.useState({})
    const [optionsForComponent, setOptionsForComponent] = React.useState({})

    const [effectsData, setEffectsData] = React.useState(undefined)

    function createCardData(fixes, wikiData) {
        const pref = isPerson ? "Person - " : "Object - "
        const doneCard: CardData = {
            displayName: fixes.displayName || wikiData.displayName,
            name: fixes.name || wikiData.name,
            img: fixes.img || wikiData.img,
            typeLine: pref + (fixes.typeLine || wikiData.typeLine),
            text: (fixes.text || wikiData.text)?.replace(/\\n/g, "\n"),
            wits: fixes.wits !== undefined ? fixes.wits : wikiData.wits,
            phys: fixes.phys !== undefined ? fixes.phys : wikiData.phys,
            cost: fixes.cost || wikiData.cost,
            flavor: fixes.flavor || wikiData.year,
            set: ""
            // set // : "WI01" // fixes.set || wikiData.set
        }
        return doneCard
    }

    const generateCardFor = (wikiData, fixes, name) => {
        if (fixes) {
            const doneCard = createCardData(fixes, wikiData)
            return "../api/svg/b64?d=" + toBase64(JSON.stringify(doneCard))
        } else {
            return "../api/svg/" + encodeURIComponent(name) + "?s=1"
        }
    }

    function setFixesState(field, name, value) {
        setFixes({...fixes, [name]: {...fixes[name], [field]: value}})
    }

    React.useEffect(() => {

        fetch("/api/effects").then(x => x.json()).then(x => {
            setEffectsData(x)
        })
        fetch("/api/badWords").then(x => x.json()).then(x => {
            setBadWords(x)
        })

        getCount().then(res => setCount(res))
        currentUser(u => {
            setUser(u)
            setLoggedOut(false)
            setLoading(false)
        }, () => {
            setLoggedOut(true)
            setLoading(false)
            console.log("no logged in user on admin?")
        })
    }, [])

    function search(text) {
        if (isLoggedOut || !effectsData || !badWords)
            return

        setQueryText(text)
        console.log("Search " + text)
        setData({})

        let res = {} as AdminLogicState
        setLoading(true)

        queryCards(isPerson, cards => {
            const newFixes = {...fixes}
            const tempOptions = {}
            res.cards = cards.map(card => {
                const wikiData = parseWikiText(card.name, isPerson, card.data.wikitext, card.data.category)
                const img = card.img?.url || card.data.img

                const builtCard = buildCardFromWiki(effectsData)({...wikiData, img}, badWords)
                let fromWiki = {
                    name: card.name,
                    displayName: card.cardData?.displayName || builtCard.name,
                    typeLine: card.cardData?.typeLine || builtCard.name,
                    img: card.cardData?.img || builtCard.img,
                    text: card.cardData?.text || builtCard.text,
                    cost: card.cardData?.cost || builtCard.cost,
                    phys: card.cardData?.phys || builtCard.phys,
                    wits: card.cardData?.wits || builtCard.wits,
                    flavor: card.cardData?.flavor || builtCard.flavor,
                    set: card.cardData?.set || builtCard.set
                }
                newFixes[card.name] = fromWiki

                let wikiDataAndChoices = {...wikiData, ...getChoices(effectsData, wikiData, card)}
                fields.forEach(field => {
                    const options = wikiDataAndChoices[field + "s"]
                    tempOptions[card.name + "-" + field] = !options ? []
                        : toSet(Object.keys(options)
                            .filter(key => options[key] !== undefined)
                        ).map(key => {
                            let label = options[key]?.toString() || ""
                            let node = <Box key={key} {...({value: label} as any)}>
                                <span>
                                    {label === "" ? "<empty>" : shorten(label)}
                                </span>
                                {isNaN(parseFloat(key))
                                    && <Chip style={{float: "right"}} label={key}
                                             variant="outlined"/>}
                            </Box>
                            return {label, node}
                        })
                })

                return ({
                    name: card.name, data: wikiDataAndChoices, img,
                    pointer: card
                })
            })

            setOptionsForComponent(tempOptions)
            setData(res)
            setFixes(newFixes)

            queryUsers(users => {
                res.users = users
                setData(res)
                setLoading(false)
            }, text)
        }, text)
    }

    const moreProps = {
        user, data, search, queryText, setQueryText, isLoggedOut: isLoggedOut || !effectsData,
        setLoggedOut, loading,
        card, setCard, count, setPerson, isPerson //, setSet, set
    }

    return <>
        <AdminBar {...moreProps} />
        <Container>
            {data?.cards?.length > 0 && <AdminTable
                {...moreProps}
                header="Cards"
                rows={data.cards} cols={["name", "data"]}
                customCol="name"
                customColFunction={entry => <div>
                    <h3>{entry.name}</h3>
                    <img src={generateCardFor(undefined, undefined, entry.name)}
                         height="300" alt="" style={{float: "right"}}/>
                    <br/>
                    <img src={entry.img} height="300" alt=""/>
                    {entry.nftUrl && <Button href={entry.nftUrl}>{'Buy'}</Button>}
                </div>}
                customCol2="data"
                customColFunction2={entry => {
                    const wikiData = entry.data
                    return !wikiData ? "" : <div>
                        <SimpleTooltip
                            placement="bottom-start"
                            title={<pre style={{
                                background: "black",
                                color: "white",
                                width: "700px"
                            }}>{wikiData.wikitext}</pre>}>
                            <div>{shorten(wikiData.wikitext?.split("\n")[0], 90) + "..."}</div>
                        </SimpleTooltip>
                        <div style={{float: "left"}}>
                            <img src={generateCardFor(wikiData, fixes[wikiData.name], wikiData.name)}
                                 height="300" alt=""/>
                            <br/>
                            {fixes[wikiData.name] &&
                                <Button color="primary" size="large" onClick={() => {
                                    setProgress(wikiData.name)
                                    const dataToTransfer = createCardData(fixes[wikiData.name], {})
                                    updateWikiCard(entry.pointer, user, wikiData.name, dataToTransfer)
                                        .then(info => {
                                            setProgress("")
                                            setInfo({[wikiData.name]: info})
                                        })
                                }}>
                                    <Save/> {'Save changes'}
                                </Button>}
                            <div>
                                {progress === wikiData.name ? <CircularProgress/> : info[wikiData.name]}
                            </div>
                        </div>

                        <div style={{display: "flex", flexDirection: "column"}}>
                            {fields.map(field => {
                                let currOptionsForComponent = optionsForComponent[wikiData?.name + "-" + field]
                                let value = ((fixes[wikiData.name] || {})[field]?.toString() || "").replace(/\n/g, "\\n")
                                let fieldToUpper = capitalize(field)
                                return <CustomAutocomplete
                                    options={currOptionsForComponent}
                                    key={field}
                                    label={fieldToUpper}
                                    inputValue={value}
                                    setInputValue={x => setFixesState(field, wikiData.name, x)}
                                />
                            })}
                        </div>
                    </div>
                }}/>}

            {data?.users?.length > 0 && <AdminTable
                {...moreProps}
                header="Users"
                rows={data.users}
                cols={["username", "email", "emailVerified"]}/>}

            {data?.cards?.length === 0 && data?.users?.length === 0 && !loading
                && "Sorry, no results for '" + queryText + "'"}

            <pre>{/*JSON.stringify(props, null, 2)*/}</pre>
        </Container>
    </>
}

export default function AdminPage() {
    return (<Layout title={gameName("ADMIN")} noCss mui>
        <HohApiWrapper>
            <AdminLogic/>
        </HohApiWrapper>
    </Layout>)
}
