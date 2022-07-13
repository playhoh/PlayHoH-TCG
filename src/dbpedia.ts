import {md5} from "./md5"
import Moralis from "moralis/node"
import {randomGen, runGrammar} from "./polygen"
import {archetypeGrammar, objectGrammar, personGrammar} from "./grammars"
import {recreateSetId} from "./cardCreation"
import {badWordList} from "./server/staticData"
import {log, toBase64, toSet} from "./utils"
import {AnalyzeResult, Card} from "../interfaces/cardTypes"
import {splitIntoBox} from "../pages/api/measureText"

function fromCategory(items: string[]) {
    const cat = items?.filter(x => x.startsWith("Category:")).map(x => x.replace(/Category:/g, "")) || []
    return (
        cat.find(x => x.endsWith(" births"))
            ?.replace(" births", "")
            ?.replace("s", "")
        || cat.find(x => x.endsWith("s ships"))
            ?.replace("s ships", "")
        || cat.find(x => x.endsWith(" works"))
            ?.replace(" works", "")
    )
}

export async function analyze(id): Promise<AnalyzeResult> {
    const dbPedia = x => "https://dbpedia.org/data/" + encodeURIComponent(x) + ".json"
    let json = undefined
    try {
        json = await fetch(dbPedia(id)).then(x => x.json())
    } catch (e) {
        log("error for id " + id + ": " + e)
    }
    if (!json)
        return undefined

    async function getVal(obj): Promise<string[]> {
        if (typeof obj === "string")
            return [obj]

        const vals = obj[0] ? obj.filter(x =>
            x.lang === 'en' || x.type === 'uri' || x.datatype?.includes('date') || x.datatype?.includes('integer')
        ) : []

        const arr = []
        for (const key in vals) {
            const valueObject = vals[key]
            if (valueObject?.datatype?.includes('date')) {
                const date = new Date(valueObject.value)
                let year = (valueObject.value.startsWith("-") ? "BC " : "") + date.getFullYear()
                let yearFormatted = year + "/" + date.getMonth() + "/" + date.getDate()
                arr.push(yearFormatted)
            } else if (valueObject?.datatype?.includes('integer')) {
                const date = parseInt(valueObject.value)
                let yearFormatted = (valueObject.value?.toString()?.startsWith("-") ? "BC " : "") + date
                arr.push(yearFormatted)
            } else {
                let value = valueObject?.value || ""
                if (valueObject?.type === 'uri') {
                    let lowerCase = value.toLowerCase()
                    if (lowerCase.includes("jpg") || lowerCase.includes("png") || lowerCase.includes("svg"))
                        arr.push(value)
                    else if (value.includes("PersonFunction")) {
                        const url = value.replace("/resource/", "/data/") + ".json"
                        try {
                            let obj1 = await fetch(url).then(x => x.json())
                            let newVar = await getVal(obj1)
                            arr.push(...newVar)
                        } catch (e) {
                            log("error for " + url + ": " + e)
                        }
                    } else {
                        let valueReplaced = value.replace("http://dbpedia.org/resource/", "")
                            .replace(/_/g, " ")
                        arr.push(valueReplaced)
                    }
                } else {
                    arr.push(value)
                }
            }
        }
        return arr
    }

    async function getAll(id) {
        const res = []

        async function iter(x) {
            for (const key in x) {
                const obj = x[key]
                let v = []
                if (key.includes("" + id) && (v = await getVal(obj))) {
                    res.push(...v)
                }
                if (typeof obj === "object") {
                    await iter(obj)
                }
            }
        }

        await iter(json)
//        console.log("found ", res)
        // if (res.length === 1)
        return toSet(res)
        //if (throws)
        //  throw new Error("Ambiguous id " + id + ": " + res.join(", "))
        //else
        //  return ""
    }

    async function get(id) {
        return (await getAll(id))[0]
    }

    const hypernym = await getAll("hypernym")
    const occupation = await getAll("occupation")
    const titles = await getAll("titles")
    const title = (await getAll("title")).filter(x =>
        !x.startsWith("List of ") && !x.startsWith("House of ")
        && !x.includes(" Party"))
    const name = await get("name")
    const birthDate = await get("birthDate")
    const openingYear = await get("openingYear")
    const commissioningDate = await get("commissioningDate")
    const completionDate = await get("completionDate")


    const years = await get("years")

    const thumbnail = await get("thumbnail")
    const types = toSet((await getAll("22-rdf-syntax-ns#type"))
        .map(x => x.substring(x.lastIndexOf("/") + 1).replace(/\d/g, ""))
        .filter(x =>
            x.length > 1
            && !x.includes("#")
            && !x.includes("Wikicat")
            && !x.includes("Yago")
            && !x.includes("LivingThing")
            && !x.includes("Organism")
            && !x.includes("Whole")
        ))
    const type = await getAll("ontology/type")
    const subject = await getAll("subject")
    const as = (await getAll("as")).filter(x => !x.startsWith("http"))
    const isPerson = types.find(x => x.includes("Person")) !== undefined
    const isThing = types.find(x => x.includes("Thing")) !== undefined
    let subType = [...occupation, ...hypernym, ...titles, ...title, ...type, ...as, ...subject].find(x =>
        !x.includes("List of ")
        && !x.includes("Category:")
    )

    if (subType?.startsWith("List of "))
        subType = subType.replace(/List of /g, "")

    const superType =
        isPerson ? "Person" : "Object"
    // isThing ? "Object" : "Archetype"
    const idReplaced = id?.replace(/_/g, " ")
    const flavour = (birthDate || years || fromCategory(subject) || openingYear || commissioningDate || completionDate)?.replace("&ndash;", " - ")

    const gen = {
        occupation,
        hypernym,
        titles,
        title,
        type,
        birthDate,
        openingYear,
        commissioningDate,
        completionDate,
        years,
        isThing,
        isPerson,
        subType,
        superType,
        subject: subject?.filter(x => x.includes("births")),
        as,
        types: types?.filter(x => !x.includes("Thing") && !x.includes("Person"))
    }
    Object.keys(gen).forEach(x => {
        if (gen[x] === undefined || gen[x]?.length === 0) {
            delete gen[x]
        }
    })
    const res = {
        name: idReplaced,
        displayName: name || idReplaced,
        typeLine: superType + " - " + subType,
        flavour,
        img: thumbnail?.replace("?width=300", "?width=500"),
        gen
    } as AnalyzeResult
    return res
}

export function convertImgUrl(url) {
    const name = url.substring(url.lastIndexOf("/") + 1).split("?")[0]
    const h = md5(name)
    const h1 = h.substring(0, 1)
    const h2 = h.substring(0, 2)
    const url2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/"
        + h1 + "/" + h2 + "/" + name + "/500px-" + name

    return url2
}

export async function saveObj(res: Card): Promise<any> {
    const CardTable = Moralis.Object.extend("Card")
    let card = new CardTable()
    card.set('name', res.name)
    card.set('displayName', res.name)
    card.set('typeLine', res.typeLine)
    card.set('flavour', res.flavour)
    card.set('cost', res.cost)
    card.set('power', res.power)
    card.set('wits', res.wits)
    card.set('typeLine', res.typeLine)
    card.set('text', res.text)
    card.set('key', res.key)
    card.set('img', res.img)
    try {
        await card.save()
    } catch (e) {
        log("error saving " + res.name + ": " + e)
        // throw e
    }
    return card
}

export async function downloadImgToBase64(url: string) {
    const imgBuffer = await fetch(url, {
        headers: {
            "Transfer-Encoding": "chunked"
        }
    }).then(x => x.arrayBuffer())
    const imgForExtCheck = url.toLowerCase().replace("jpeg", "jpg")

    const pref =
        imgForExtCheck.includes(".svg")
            ? "data:image/svg;base64," :
            imgForExtCheck.includes(".png")
                ? "data:image/png;base64,"
                : "data:image/jpeg;base64,"

    const imgBase64 = toBase64(imgBuffer)
    return pref + imgBase64
}

export function generateValuesBasedOnCost(cost: number, upkeep: boolean, r: () => number) {
    let maxSum = cost + 1
    if (upkeep)
        maxSum++

    let sum = 1000, wits = 0, power = 0
    while (sum === 0 || sum > maxSum) {
        wits = r() % maxSum
        power = r() % maxSum
        sum = wits + power
    }
    return {sum, wits, power}
}


export async function buildCardFromObj(x: AnalyzeResult, skipImg?: boolean): Promise<Card> {
    const r = randomGen(x.name)
    const grammar = x.typeLine.startsWith("Archetype")
        ? archetypeGrammar
        : x.typeLine.startsWith("Object")
            ? objectGrammar
            : personGrammar

    let text = ""
    let arr = []
    do {
        if (arr.length > 4) {
            console.log("had to generate again: splitIntoBox", arr.length, "\n", arr)
        }
        text = runGrammar(grammar, r)
        arr = splitIntoBox(text)
    } while (arr.length > 4)
    const key = recreateSetId(x.name, badWordList)
    const cost = 1 + (r() % 4)
    const upkeep = text.includes("Main: Pay [R] or end this")
    let witsGenerated = undefined
    let powerGenerated = undefined
    if (x.typeLine.startsWith("Person - ")) {
        const {wits, power} = generateValuesBasedOnCost(cost, upkeep, r)
        powerGenerated = power
        witsGenerated = wits
    }

    let url = skipImg ? "" : convertImgUrl(x.img)

    // console.log("convertImgUrl", x.img, "url", url)
    const img = skipImg ? "" : await downloadImgToBase64(url)

    const res = {...x, text, cost, wits: witsGenerated, power: powerGenerated, key, img} as Card

    return res
}

export async function getItemsFromCat(cat: string) {
    let items = []

    try {
        const obj = await fetch("https://dbpedia.org/data/" + cat + ".json").then(x => x.json())
        // console.log("obj", obj)
        Object.keys(obj).forEach(x => {
            let value = x.substring(x.lastIndexOf("/") + 1)
            //if (!value.includes("Category:"))
            items.push(value)
        })
    } catch (e) {
        console.log("error for item " + cat + ": " + e.toString())
    }
    return items
}
