import React from "react"
import {debug, parseUrlParams, toBase64} from "../src/utils"
import {getCount} from "../src/baseApi"
import {HohApiWrapper} from "../src/client/clientApi"
import {Button, CircularProgress, Container} from "@mui/material"
import {AdminBar} from "../components/AdminBar"
import {currentUser} from "../src/client/userApi"
import {recreateSetId} from "../src/cardCreation"
import {CardData} from "../interfaces/cardTypes"
import {gameName} from "../components/constants"
import {Layout} from "../components/Layout"

const fields = ["displayName", "cost", "img", "imgPos", "typeLine", "text", "flavour", "power", "wits"]

function shorten(x: string, len?: number): string {
    len = len || 50
    return x?.length > len ? x.substring(0, len) + "..." : x
}

function getChoices(effectsData, entry, dbItem) {
    if (!entry)
        return {}

    return {
        flavors: entry.years,
        texts: [""],
        costs: [1, 2, 3, 4],
        powers: ["", 0, 1, 2, 3, 4],
        physs: ["", 0, 1, 2, 3, 4],
        imgs: [
            entry.img,
            //dbItem?.img?.url,
            //pref + "/static/img/Albert_Einstein.jpg",
            //BASE_URL + "/static/img/Man_in_hood.jpg",
            //pref + "/static/img/Cochise.jpg",
            //BASE_URL + "/static/obj/Battery_Prototype.jpg",
            //BASE_URL + "/static/obj/Fire_Ritual.jpg"
        ].filter(x => x),
        imgPoss: ["xMidYMin", "xMinYMin", "xMaxYMax", "xMidYMid", "xMidYMax"]
    }
}

type AdminLogicState = { cards?: any[], users?: any[] }

const AdminLogic = () => {
    const [user, setUser] = React.useState(undefined)
    const [isLoggedOut, setLoggedOut] = React.useState(undefined)
    const [card, setCard] = React.useState(undefined)
    const [count, setCount] = React.useState(undefined)
    const [data, setData] = React.useState<AdminLogicState>({})
    const [entry, setEntry] = React.useState<any>(undefined)

    const [queryText, setQueryText] = React.useState("")
    const [progress, setProgress] = React.useState(false)
    // const [set, setSet] = React.useState("WI01")
    const [info, setInfo] = React.useState("")
    const [loading, setLoading] = React.useState(true)

    const [badWords, setBadWords] = React.useState([])
    const [fixes, setFixes] = React.useState({})
    const [optionsForComponent, setOptionsForComponent] = React.useState({})

    const [effectsData, setEffectsData] = React.useState(undefined)

    function createCardData(fixes, obj) {
        const doneCard: CardData = {
            displayName: fixes.displayName || obj.displayName,
            name: fixes.name || obj.name,
            img: fixes.img || obj.img,
            typeLine: (fixes.typeLine || obj.typeLine),
            text: (fixes.text || obj.text)?.replace(/\\n/g, "\n"),
            wits: fixes.wits !== undefined ? fixes.wits : obj.wits,
            phys: fixes.phys !== undefined ? fixes.phys : obj.phys,
            cost: fixes.cost || obj.cost,
            flavor: fixes.flavor || obj.year,
            set: recreateSetId(obj.name, badWords),
            imgPos: fixes.imgPos
            // set // : "WI01" // fixes.set || entry.set
        }
        return doneCard
    }

    const generateCardFor = (obj, fixes, key) => {
        if (fixes) {
            const doneCard = createCardData(fixes, obj)
            return "../api/img/b64-" + toBase64(JSON.stringify(doneCard))
        } else {
            return "../api/img/" + key
        }
    }

    function setFixesState(field, name, value) {
        setFixes({...fixes, [field]: value})
    }

    React.useEffect(() => {
        let params = parseUrlParams()
        debug("params", params)

        getCount().then(res => setCount(res))
        currentUser(u => {
            setUser(u)
            setLoggedOut(false)

            Promise.all(
                [fetch("/api/effects").then(x => x.json()).then(x => {
                    setEffectsData(x)
                }), fetch("/api/badWords").then(x => x.json()).then(x => {
                    setBadWords(x)
                })]).then(() => {
                    setLoading(false)

                    const q = params.q
                    if (q) {
                        search(q, true, params.o)
                    }
                }
            )

        }, () => {
            setLoggedOut(true)
            setLoading(false)
            console.log("no logged in user on admin?")
        })
    }, [])

    function search(text, overrideCall?: boolean, searchObjects?: boolean) {
        let effectsData = undefined
        setEffectsData(x => {
            effectsData = x
            return x
        })
        let badWords = undefined
        setBadWords(x => {
            badWords = x
            return x
        })

        if (!overrideCall && (isLoggedOut || !effectsData || !badWords))
            return

        setQueryText(text)
        console.log("Search " + text)
        setData({})

        let res = {} as AdminLogicState
        setLoading(true)

        fetch("/api/cards/" + text).then(x => x.json()).then(res => {
            setEntry(res)
        })

        /*
                let person = searchObjects !== undefined ? !searchObjects : isPerson
                queryCards(person, cards => {
                    const newFixes = {...fixes}
                    const tempOptions = {}
                    res.cards = cards.map(card => {
                        const entry = parseWikiText(card.name, person, card.data.wikitext, card.data.category)
                        const img = card.img?.url || card.data.img

                        const builtCard = buildCardFromWiki(effectsData)({...entry, img}, badWords)
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

                        let entryAndChoices = {...entry, ...getChoices(effectsData, entry, card)}
                        fields.forEach(field => {
                            const options = entryAndChoices[field + "s"]
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
                            name: card.name, data: entryAndChoices, img,
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


                }, text) */
    }

    const moreProps = {
        user, data, search, queryText, setQueryText, isLoggedOut: isLoggedOut || !effectsData,
        setLoggedOut, loading,
        card, setCard, count
    }

    return <>
        <AdminBar {...moreProps} />
        <Container>

            {entry && <div>
                {/*<SimpleTooltip
                    placement="left-start"
                    title={<pre style={{
                        background: "black",
                        color: "white",
                        width: "700px",
                        fontSize: "60%"
                    }}>{entry.wikitext}</pre>}>
                    <div>{shorten(entry.wikitext?.split("\n")[0], 90) + "..."}</div>
                </SimpleTooltip>*/}
                <div style={{float: "left"}}>
                    <h3>
                        <a style={{color: "white"}}
                           href={"https://dbpedia.org/page/" + entry?.name.replace(/ /g, "_")}>{entry?.name}</a>
                    </h3>
                    <img src={generateCardFor(undefined, undefined, entry?.key?.replace("#", ""))}
                         height="300" alt="" style={{float: "right"}}/>

                    {entry?.nftUrl && <Button href={entry?.nftUrl}>{'nft'}</Button>}

                    {/*<img src={generateCardFor(entry, fixes, "")}
                         height="300" alt=""/>
                    */}
                    <br/>
                    {/*Object.keys(fixes).find(x => fixes[x]) && <>
                        <Button color="primary" size="large" onClick={() => {
                            setProgress(true)
                            const dataToTransfer = createCardData(fixes, {})
                            updateWikiCard(entry.pointer, user, entry.name, dataToTransfer)
                                .then(info => {
                                    setProgress(false)
                                    setInfo(info)
                                })
                        }}>
                            <Save/> {'Save changes'}
                        </Button>
                        <Button color="error" size="large" onClick={() => {
                            setProgress(true)

                            deleteWikiCard(entry.pointer, entry.name)
                                .then(info => {
                                    setProgress(false)
                                    setInfo(info)
                                })
                        }}>
                            <DeleteForever/> {'Delete'}
                        </Button>
                    </>*/}
                    <div>
                        {progress === entry.name ? <CircularProgress/> : info}
                    </div>
                </div>

                <div style={{display: "flex", flexDirection: "column"}}>
                    {/*fields.map(field => {
                        let currOptionsForComponent = optionsForComponent[entry?.name + "-" + field] || []
                        let value = (fixes[field]?.toString() || "").replace(/\n/g, "\\n")
                        let fieldToUpper = capitalize(field)
                        return <CustomAutocomplete
                            options={currOptionsForComponent}
                            key={field}
                            label={fieldToUpper}
                            inputValue={value}
                            setInputValue={x => setFixesState(field, entry.name, x)}
                        />
                    })*/}
                </div>
            </div>}

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
