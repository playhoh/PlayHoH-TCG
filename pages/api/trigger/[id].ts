import {TRIGGER_SECRET_KEY} from "../../../components/constants"
import {debug, log, now} from "../../../src/utils"
import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj, getItemsFromCat, saveObj} from "../../../src/server/dbpedia"
import {sendToDiscord} from "../tracking/[id]"
import {AnalyzeResult} from "../../../interfaces/cardTypes"

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

export async function trigger(sendAnyway?: boolean, predefinedListOnly?: string[], shallowFetching?: boolean) {
    const startTime = new Date().getTime()
    log("started task at " + now())

    moralisSetup(true, Moralis)

    debug("Moralis.serverURL", Moralis.serverURL)

    const toDo1 = [
        ...(predefinedListOnly || [])
        // Category:European_rulers
        //"Category:1200s_ships",
        //"Category:Science_by_century",
        /*"F. J. Duarte",
        "Yellow Emperor",
        "Ku",
        "Zhuanxu",
        "Category:Science_by_century"*/
        //"The_Flying_Deer_(ship)",
        //"Category:1630s_ships",
        //"Invention",
        //"List_of_inventions_named_after_people",
        //"Timeline_of_historic_inventions"
        //"Albion-class_ship_of_the_line_(1763)",
        //"List_of_ships_of_the_line_of_the_Royal_Navy",
        //"Hospital"
        //"Template:Infobox_ship_characteristics"
        //"Her_Majesty's_Ship"
        //"Category:Buildings_and_structures_by_type_and_year_of_completion",
        //        "Template:Birth_year_category_header"
    ]
    let toDo = []

    toDo.push(...toDo1)
    const done = {}
    let saved = 0
    let notSaved = 0

    function notSavedInfo(x: AnalyzeResult, y: string) {
        notSaved++
        console.log("sorry, ", x.name, " had no img or year or type or too new (" + y + "): ", x, " and wasn't saved. (Saved: " + saved + ", Not Saved: " + notSaved + ")")
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
        if (!x) {
            console.log("no json for id " + item)
            continue
        }

        //if (x.name.includes(" in ") || x.name.includes("Category") || x.name.includes("List of")
        //  || parseInt(item) === item || x.typeLine.includes("Archetype")) {
        //console.log("Skipped " + item)
        //    continue
        //}
        if (!x.img || x.img.includes(";base64,PCFET0NUW") || x.typeLine.includes("undefined") || !x.flavour) {
            notSavedInfo(x, undefined)
            continue
        }

        const {y, tooNew} = isTooNew(x.flavour)

        if (tooNew) {
            notSavedInfo(x, y)
            continue
        }

        const res = await buildCardFromObj(x)
        //const card =
        const savedInDb = await saveObj(res)

        const url = "https://playhoh.com/c/" + res.key.replace(/#/, "")
        if (savedInDb) {
            res.img = "<omitted in log>"

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

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))

    let validKey = id === TRIGGER_SECRET_KEY()
    log("api/trigger was called with validKey", validKey)

    if (validKey) {
        const str = await trigger()
        res.status(200).end(str)
    } else
        res.status(404).end("not found (404)")
}
