import {TRIGGER_SECRET_KEY} from "../../../components/constants"
import {debug, log, now} from "../../../src/utils"
import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj, getItemsFromCat, saveObj} from "../../../src/dbpedia"
import {sendToDiscord} from "../tracking/[id]"

export async function trigger(sendAnyway?: boolean) {
    const startTime = new Date().getTime()
    log("started task at " + now())

    moralisSetup(true, Moralis)

    debug("Moralis.serverURL", Moralis.serverURL)

    const toDo1 = [
        "The_Flying_Deer_(ship)",
        "Category:1630s_ships"
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
    while (toDo.length > 0) {
        const item = toDo.pop()

        if ((saved + notSaved) % 4 === 0) {
            toDo = toDo.sort(() => Math.random() - 0.5)
        }

        if (!done[item]) {
            done[item] = true
            let newItems = (await getItemsFromCat(item)).filter(x => !done[x])
            toDo.push(...newItems)
        }

        const x = await analyze(item)
        if (!x) {
            console.log("no json for id " + item)
            continue
        }

        if (x.name.includes(" in ") || x.name.includes("Category") || x.name.includes("List of")
            || parseInt(item) === item || x.typeLine.includes("Archetype")) {
            //console.log("Skipped " + item)
            //    continue
        }

        const y = x.flavour && x.flavour.split("/")[0]
        const tooNew = parseInt(y) && parseInt(y) >= 1900

        if (!x.img || !x.flavour || x.typeLine.includes("undefined") || tooNew) {
            notSaved++
            console.log("sorry, ", x.name, " had no img or year or type or too new (" + y + "): ", x, " and wasn't saved. (Saved: " + saved + ", Not Saved: " + notSaved + ")")
            continue
        }
        const res = await buildCardFromObj(x)
        //const card =
        await saveObj(res)

        res.img = "<omitted in log>"

        console.log("res", item, "=>", res.name, "res", res, "//", x.gen?.superType, "saved")
        saved++

        const url = "https://playhoh.com/c/" + res.key.replace(/#/, "")
        sendToDiscord("New Card :tada:\n" + res.displayName + "\n" + res.typeLine + "\n(" + res.flavour + ")\n" + url, sendAnyway)
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
