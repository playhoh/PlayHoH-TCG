import React from "react"
import {base64OfHtml, capitalize, debug, parseUrlParams, toBase64, toBase64FromUrl, toSet} from "../src/utils"
import {HohApiWrapper} from "../src/client/clientApi"
import {Box, Button, CircularProgress, Container} from "@mui/material"
import {AdminBar} from "../components/AdminBar"
import {useUser} from "../src/client/userApi"
import {Api} from "../src/Api"
import {Card} from "../interfaces/cardTypes"
import {gameName} from "../components/constants"
import {Layout} from "../components/Layout"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {LoginFirst} from "../components/LoginFirst"
import {DeleteForever, Save} from "@mui/icons-material"
import {CustomAutocomplete} from "../components/CustomAutocomplete"

const fields = ["displayName", "cost", "img", "imgPos", "typeLine", "text", "flavour", "power", "wits", "comment"]

function shorten(x: string, len?: number): string {
    len = len || 50
    return x?.length > len ? x.substring(0, len) + "..." : x
}

function getChoices(entry) {
    if (!entry)
        return {}

    return {
        flavours: toSet([entry.flavour, entry.flavour?.split("/")[0]]),
        texts: [entry.text],
        comment: [entry.comment],
        costs: [1, 2, 3, 4],
        powers: ["", 0, 1, 2, 3, 4],
        witss: ["", 0, 1, 2, 3, 4],
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

function createCardData(fixes, obj) {
    const doneCard: any = {
        displayName: fixes.displayName || obj.displayName,
        name: fixes.name || obj.name,
        img: (fixes.img?.startsWith("data:image/") ? "from-db" : fixes.img) || obj.img,
        typeLine: fixes.typeLine || obj.typeLine || "",
        text: (fixes.text || obj.text)?.replace(/\\n/g, "\n") || "",
        wits: toNum(fixes.wits),
        power: toNum(fixes.power),
        cost: toNum(fixes.cost),
        flavour: fixes.flavour || obj.flavour,
        imgPos: fixes.imgPos || obj.imgPos,
        key: obj.key,
        comment: fixes.comment || obj.comment
    }
    return doneCard
}

function findCardByName(name: string) {
    let query = new Api.Query('Card')
    query.equalTo('name', name)
    return query.first()
}

function toNum(str: string) {
    return (str + "")?.trim()?.length === 0 ? undefined : parseFloat(str)
}

const EditorLogic = () => {
    const {user, isAuthenticated} = useUser()
    const [isLoggedOut, setLoggedOut] = React.useState(undefined)
    const [card, setCard] = React.useState(undefined)
    const [count, setCount] = React.useState(undefined)
    const [entry, setEntry] = React.useState<any>(undefined)

    const [queryText, setQueryText] = React.useState("")
    // const [progress, setProgress] = React.useState(true)
    // const [set, setSet] = React.useState("WI01")
    const [info, setInfo] = React.useState("")
    const [loading, setLoading] = React.useState(true)

    const [fixes, setFixes] = React.useState<Card>({} as any)
    const [optionsForComponent, setOptionsForComponent] = React.useState({})

    const generateCardFor = (obj, fixes, key) => {
        if (fixes) {
            const doneCard = createCardData(fixes, obj)
            return "../api/img/b64-" + toBase64(JSON.stringify(doneCard)).replace(/\//g, "_")
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

        //getCount().then(res => setCount(res))

        const q = params.q
        if (q) {
            search(q, true, params.o)
        } else {
            setLoading(false)
        }

    }, [])

    function search(text, overrideCall?: boolean, searchObjects?: boolean) {
        if (!overrideCall && isLoggedOut)
            return

        setQueryText(text)
        console.log("Search " + text)

        setLoading(true)
        fetch("/api/cards/" + text.replace(/#/g, "") + "?full=1").then(x => x.json()).then(jsonRes => {
            setEntry(jsonRes)

            let choices = getChoices(jsonRes)
            const res = {}
            fields.forEach(field => {
                const options = choices[field + "s"]
                if (options) {
                    const opt = options.map((item, i) => {
                        let label = item?.toString() || ""
                        let node = <Box key={field + i} {...({value: label} as any)}>
                                        <span>
                                            {label === "" ? "<empty>" : shorten(label)}
                                        </span>
                            {/*isNaN(parseFloat(key))
                                && <Chip style={{float: "right"}} label={key}
                                         variant="outlined"/>*/}
                        </Box>
                        return {label, node}
                    })
                    res[field] = opt
                }
            })
            setOptionsForComponent(res)

            setFixes(jsonRes)
            setLoading(false)
        })
    }

    const moreProps = {
        user, search, queryText, setQueryText, isLoggedOut,
        setLoggedOut, loading,
        card, setCard, count
    }

    function saveCard() {
        setLoading(true)
        const dataToTransfer = createCardData(fixes, entry)
        let promise = findCardByName(entry.name)
        promise.then(pointer => {
            if (pointer) {
                const imgProcess =
                    dataToTransfer.img?.startsWith("http")
                        ? toBase64FromUrl(dataToTransfer.img, undefined)
                            .then(base64 => {
                                if (base64 && !base64.includes(base64OfHtml))
                                    return base64
                            })
                        : Promise.resolve()

                imgProcess.then(img => {
                    if (img)
                        pointer.set('img', img)

                    pointer.set('text', dataToTransfer.text)
                    pointer.set('power', dataToTransfer.power)
                    pointer.set('wits', dataToTransfer.wits)
                    pointer.set('cost', dataToTransfer.cost)
                    pointer.set('displayName', dataToTransfer.displayName)
                    pointer.set('flavour', dataToTransfer.flavour)
                    pointer.set('imgPos', dataToTransfer.imgPos)
                    pointer.set('typeLine', dataToTransfer.typeLine)
                    pointer.set('comment', dataToTransfer.comment)
                    pointer.set('needsMinting', true)

                    pointer.save().then(() => {
                        setInfo("Saved " + dataToTransfer.key + " in db.")
                        setLoading(false)
                    })
                })
            } else {
                setInfo("not found: " + entry.name)
                setLoading(false)
            }
        })
    }

    function deleteCard() {
        setLoading(true)
        let promise = findCardByName(entry.name)
        promise.then(x => {
            if (x) {
                x.destroy().then(() => {
                    setInfo("deleted " + entry.name + " from db")
                    setLoading(false)
                })
            } else {
                setInfo("not found: " + entry.name)
                setLoading(false)
            }
        })
    }

    return !isAuthenticated ? <LoginFirst/> : !user?.isAdmin ? <AskAnAdmin/> : <>
        <AdminBar {...moreProps} />
        <Container>
            {!entry ? (loading ? "" : <div>
                {'Not found: ' + queryText}
                <br/>
                <Button fullWidth color="primary" href="/create">{'Create a card'}</Button>
            </div>) : <div>
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
                           href={"https://dbpedia.org/page/" + entry?.name?.replace(/ /g, "_")}>{entry?.name}</a>
                    </h3>
                    <h4>{'Public Image for ID'}</h4>
                    <img src={generateCardFor(undefined, undefined, entry?.key?.replace("#", "")) + "?nc=1"}
                         height="300" alt=""/>
                    <h4>{'Editor Preview Image'}<small>{' with tooltip'}</small></h4>
                    <img src={generateCardFor(entry, fixes, entry?.key?.replace("#", ""))}
                         height="300" alt="" title={fixes.comment || entry.comment || ""}/>

                    {entry?.nftUrl && <Button href={entry?.nftUrl}>{'nft'}</Button>}

                    {/*<img src={generateCardFor(entry, fixes, "")}
                         height="300" alt=""/>
                    */}
                </div>

                <div style={{display: "flex", flexDirection: "column"}}>
                    <pre>{/*"Entry:\n" + JSON.stringify(entry, null, 2)*/}</pre>
                    {fields.map(field => {
                        let currOptionsForComponent = optionsForComponent[field] || []
                        let value = (fixes[field]?.toString() || "").replace(/\n/g, "\\n")
                        let fieldToUpper = capitalize(field)
                        return <CustomAutocomplete
                            options={currOptionsForComponent}
                            key={field}
                            label={fieldToUpper}
                            inputValue={value}
                            setInputValue={x => setFixesState(field, entry.name, x)}
                        />
                    })}
                    <br/>
                    {Object.keys(fixes).find(x => fixes[x]) && <>
                        <Button color="primary" size="large" onClick={() => saveCard()}>
                            <Save/> {'Save changes'}
                        </Button>
                        <br/>
                        {'- or - '}
                        <br/>
                        <Button color="error" size="large" onClick={() => deleteCard()}>
                            <DeleteForever/> {'Delete'}
                        </Button>
                    </>}
                    <div>
                        {loading ? <CircularProgress/> : info}
                    </div>
                </div>
            </div>}
        </Container>
    </>
}

export default function EditorPage() {
    return (<Layout title={gameName("Editor")} noCss mui>
        <HohApiWrapper>
            <EditorLogic/>
        </HohApiWrapper>
    </Layout>)
}
