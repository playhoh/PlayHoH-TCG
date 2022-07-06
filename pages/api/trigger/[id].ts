import {TRIGGER_SECRET_KEY} from "../../../components/constants"
import {debug, log, now} from "../../../src/utils"
import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj, getItemsFromCat, saveObj} from "../../../src/dbpedia"

export async function trigger() {
    const startTime = new Date().getTime()
    log("started task at " + now())

    moralisSetup(true, Moralis)

    debug("Moralis.serverURL", Moralis.serverURL)

    const toDo1 = [
        "Template:Birth_year_category_header"
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

        if (!x.img || !x.flavour || x.typeLine.includes("undefined")) {
            notSaved++
            console.log("sorry, ", x.name, " had no img or year or type: ", x, " and wasn't saved. (Saved: " + saved + ", Not Saved: " + notSaved + ")")
            continue
        }
        const res = await buildCardFromObj(x)
        //const card =
        await saveObj(res)

        res.img = "<omitted in log>"

        console.log("res", item, "=>", res.name, "res", res)
        saved++

    }

    const time = new Date().getTime() - startTime
    return "took " + Math.floor(time / 1000) + "s, saved " + saved + ", not saved " + notSaved
}

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))

    let validKey = id === TRIGGER_SECRET_KEY
    log("api/trigger was called with validKey", validKey)

    if (validKey) {
        const str = await trigger()
        res.status(200).end(str)
    } else
        res.status(404).end("not found (404)")
}
