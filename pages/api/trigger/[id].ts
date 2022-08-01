import {TRIGGER_SECRET_KEY} from "../../../components/constants"
import {base64OfHtml, debug, log, now, shortenWithLength} from "../../../src/utils"
import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj, getItemsFromCat, saveObj} from "../../../src/server/dbpedia"
import {sendToDiscord} from "../track"
import {AnalyzeResult} from "../../../interfaces/cardTypes"
import {NextApiRequest, NextApiResponse} from "next"

export function isTooNew(flavour: string) {
    if (flavour.includes("20th century"))
        return {tooNew: true, y: "20th century"}
    else if (flavour.includes("21st century"))
        return {tooNew: true, y: "21st century"}
    else if (flavour.includes("22nd century"))
        return {tooNew: true, y: "22nd century"}

    let parts =
        flavour.includes("/") ? flavour.split("/")
            : flavour.includes(" or ") ? flavour.split(" or ")
                : flavour.split("-")
    let y = ((!isNaN(parseInt(parts[0])) && parts[0]) || parts[parts.length - 1] || "").replace(/\D/g, "")

    if (flavour.includes("BC"))
        return {y: flavour, tooNew: false, yearAsNumber: -parseInt(flavour.replace(/(BCE?|AD)/g, "").trim())}

    let yearAsNumber = parseInt(y)
    if (isNaN(yearAsNumber)) {
        parts = y.split(" ")
        y = parts[1] || parts[parts.length - 1]
    }

    yearAsNumber = parseInt(y)
    const tooNew = isNaN(yearAsNumber) || yearAsNumber >= 1900
    return {y, tooNew, yearAsNumber}
}

export async function checkAndBuildObj(x: AnalyzeResult, notSavedInfo, name, skipImg?: boolean) {
    if (!x) {
        notSavedInfo(undefined, "no json for id " + name)
        return
    }

    //if (x.name.includes(" in ") || x.name.includes("Category") || x.name.includes("List of")
    //  || parseInt(item) === item || x.typeLine.includes("Archetype")) {
    //console.log("Skipped " + item)
    //    continue
    //}
    const error =
        x.typeLine.includes("undefined") ? "undefined in typeLine"
            : !x.flavour ? "no flavour"
                : !x.img ? skipImg ? "" : "no img"
                    : ""
    if (error) {
        notSavedInfo(x, error)
        return
    }

    const {y, tooNew, yearAsNumber} = isTooNew(x.flavour)

    if (tooNew) {
        notSavedInfo(x, "isTooNew: " + yearAsNumber + " (was " + y + ")")
        return
    }

    const res = await buildCardFromObj(x, skipImg)
    if (res.img.includes(base64OfHtml)) {
        notSavedInfo(x, "base64 of html as image")
        return
    }
    return res
}

export async function trigger(sendAnyway?: boolean, predefinedListOnly?: string[], shallowFetching?: boolean) {
    const startTime = new Date().getTime()
    log("started task at " + now())

    moralisSetup(true, Moralis)
    debug("Moralis.serverURL", Moralis.serverURL)

    let toDo = predefinedListOnly || [
        "Template:Birth_decade_category_header",
        "Engineering",
        "Maritime_transport",
        "Art_exhibition",
        "Cultural_artifact"
    ]
    const done = {}
    let saved = 0
    let notSaved = 0

    function notSavedInfo(analyzeResult: AnalyzeResult, y: string) {
        notSaved++
        if (analyzeResult?.comment) {
            analyzeResult.comment = shortenWithLength(analyzeResult.comment)
        }
        if (analyzeResult?.gen?.abstract) {
            analyzeResult.gen.abstract = shortenWithLength(analyzeResult.gen.abstract)
        }
        console.log("sorry, ", analyzeResult?.name, " had no img or year or type or too new (" + y + "): ",
            analyzeResult,
            " and wasn't saved. (Saved: " + saved + ", Not Saved: " + notSaved + ")")
    }

    while (toDo.length > 0) {
        const item = toDo.pop()

        if ((saved + notSaved) % 4 === 0) {
            toDo = toDo.sort(() => Math.random() - 0.5)
        }

        if (!done[item]) {
            done[item] = true
            if (!shallowFetching) {
                let newItems = (await getItemsFromCat(item)).filter(x => !done[x])
                toDo.push(...newItems)
            }
        }

        const x = await analyze(item)
        const res = await checkAndBuildObj(x, notSavedInfo, item)
        if (!res) {
            continue
        }
        const savedInDb = await saveObj(res)

        const url = "https://playhoh.com/c/" + res.key.replace(/#/, "")
        if (savedInDb) {
            res.img = "<omitted in log>"
            if (res.comment)
                res.comment = shortenWithLength(res.comment)

            console.log("res", item, "=>", res.name, "res", res, "//", x.gen?.superType,
                "saved: https://playhoh.com/api/img/" + res.key.replace("#", ""))
            saved++

            sendToDiscord("New Card :tada:\n" + res.displayName + "\n" + res.typeLine + "\n(" + res.flavour + ")\n" + url, sendAnyway)
        } else {
            console.log("item", item, "already existed, check: " + url)
        }
    }

    const time = new Date().getTime() - startTime
    return "took " + Math.floor(time / 1000) + "s, saved " + saved + ", not saved " + notSaved
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))

    let validKey = id === TRIGGER_SECRET_KEY()
    log("api/trigger was called with validKey", validKey)

    if (validKey) {
        const str = await trigger()
        res.status(200).end(str)
    } else
        res.status(404).end("not found (404)")
}
