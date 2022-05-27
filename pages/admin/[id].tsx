import Layout from "../../components/Layout"
import React from "react"
import {queryCards, updateWikiCard} from "../../src/client/cardApi"
import {getCount, HohApiWrapper} from "../../src/client/baseApi"
import {Box, Button, Chip, Container} from "@mui/material"
import AdminBar from "../../components/AdminBar"
import AdminTable from "../../components/AdminTable"
import {currentUser, queryUsers} from "../../src/client/userApi"
import {parseWikiText} from "../../src/wikiApi"
import {capitalize, debugOn, toBase64, toSet} from "../../src/utils"
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "../../src/effectsApi"
import {Save} from "@mui/icons-material"
import {buildCardFromWiki} from "../../src/cardCreation"
import {SimpleTooltip} from "../../components/SimpleTooltip"
import CustomAutocomplete from "../../components/CustomAutocomplete"
import {GetStaticPathsContext, GetStaticPropsContext} from "next/types"
import {CardData} from "../../interfaces/cardTypes"
import {gameName} from "../../components/constants"

export async function getStaticPaths(context: GetStaticPathsContext) {
    return {
        paths: ["/admin/secretadminaccessnevergivethistoothers"], fallback: false
    }
}

export async function getStaticProps(context: GetStaticPropsContext) {
    return {
        props: {data: context.params},
    }
}

//"https://i.imgur.com/5wutLhx.png"

const fields = ["displayName", "cost", "img", "typeLine", "text", "flavor", "wits", "phys"]

function shorten(x: string, len?: number): string {
    len = len || 50
    return x?.length > len ? x.substring(0, len) + "..." : x
}

const pref = debugOn ? "http://localhost:3000" : "http://playhoh.com"

function getChoices(effectsData, wikiData, dbItem) {
    if (!wikiData)
        return {}

    let f = getRelevantEffectsFor(effectsData)
    let fCat = getRelevantEffectsForObjectCategory(effectsData)

    let eff = []
    //debug("effectsData && wikiData?.typeLines", effectsData, wikiData?.typeLines)
    if (effectsData && wikiData.typeLines) {
        Object.keys(wikiData.typeLines).forEach(key => {
            const t = wikiData.typeLines[key]
            if (t) {
                eff.push(...(f(t) || []))
                eff.push(...(fCat(t) || []))
                t.split(' ').forEach(part => {
                    eff.push(...(f(part) || []))
                    eff.push(...(fCat(part) || []))
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
            pref + "/static/img/Albert_Einstein.jpg",
            pref + "/static/img/Man_in_hood.jpg",
            pref + "/static/img/Cochise.jpg",
            pref + "/static/obj/Battery_Prototype.jpg",
            pref + "/static/obj/Fire_Ritual.jpg"
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
    const [info, setInfo] = React.useState({})
    const [loading, setLoading] = React.useState(true)
    const [isPerson, setPerson] = React.useState(true)
    const [fixes, setFixes] = React.useState({})
    const [optionsForComponent, setOptionsForComponent] = React.useState({})

    const [effectsData, setEffectsData] = React.useState(undefined)

    const generateCardFor = (wikiData, fixes, name) => {
        const pref = isPerson ? "Person - " : "Object - "
        if (fixes) {
            const doneCard: CardData = {
                name: fixes.displayName || wikiData.displayName,
                img: fixes.img || wikiData.img,
                typeLine: pref + (fixes.typeLine || wikiData.typeLine),
                text: (fixes.text || wikiData.text)?.replace(/\\n/g, "\n"),
                wits: fixes.wits !== undefined ? fixes.wits : wikiData.wits,
                phys: fixes.phys !== undefined ? fixes.phys : wikiData.phys,
                cost: fixes.cost || wikiData.cost,
                flavor: fixes.flavor || wikiData.year,
                set: "WI01" // fixes.set || wikiData.set
            }
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
        if (isLoggedOut || !effectsData)
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

                const builtCard = buildCardFromWiki(effectsData)({...wikiData, img})
                newFixes[card.name] = {
                    displayName: builtCard.name,
                    typeLine: builtCard.name,
                    img: builtCard.img,
                    text: builtCard.text,
                    cost: builtCard.cost,
                    phys: builtCard.phys,
                    wits: builtCard.wits,
                    flavor: builtCard.flavor,
                    set: builtCard.set
                }

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
        card, setCard, count, setPerson, isPerson
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
                                    updateWikiCard(entry.pointer, user, wikiData.name, fixes[wikiData.name])
                                        .then(info => setInfo({[wikiData.name]: info}))
                                }}>
                                    <Save/> {'Save changes'}
                                </Button>}
                            <div>
                                {info[wikiData.name]}
                            </div>
                        </div>

                        <div style={{display: "flex", flexDirection: "column"}}>
                            {fields.map(field => {
                                let currOptionsForComponent = optionsForComponent[wikiData?.name + "-" + field]
                                let value = (fixes[wikiData.name] || {})[field]?.toString() || ""
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
