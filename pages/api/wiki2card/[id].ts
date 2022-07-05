import {debug, log, parseUrlParams} from "../../../src/utils"
import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/baseApi"
import {getImageForName, getWikiTextForName} from "../../../src/server/cardLookup"
import {parseWikiText} from "../../../src/wikiApi"
import {badWordList} from "../../../src/server/staticData"
import {recreateSetId} from "../../../src/cardCreation"
import {WikiData} from "../../../interfaces/wikiTypes"

async function saveObj(moreData: WikiData, isPerson: boolean) {
    moralisSetup(false, Moralis)

    const {name, typeLine} = moreData

    const WikiPerson = Moralis.Object.extend("WikiPerson")
    const WikiObject = Moralis.Object.extend("WikiObject")
    const classObj = isPerson ? WikiPerson : WikiObject
    const query = new Moralis.Query(classObj)
    query.equalTo("name", name)

    const results = await query.first()
    // debug("results wiki2card ", name, "=>", results)

    if (!results) {
        //const item = results[0]
        const item = new classObj()
        item.set("name", name)
        item.set("key", recreateSetId(name, badWordList))
        item.set('data', moreData)

        try {
            const result = await item.save()
            debug("saved moreData for " + name + " (" + (isPerson ? "P" : "O") +
                "), " + result.objectId)
        } catch (e) {
            log("error saving in wiki2card", name, " (keys:", Object.keys(moreData), ") ", e.toString(),
                "\nDUMP\n", moreData)
        }
    }
}

// https://github.com/spencermountain/wtf_wikipedia
export default async (req, res) => {
    const id0 = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const start = id0.indexOf("?")
    const params = parseUrlParams("?" + search)
    const name = start === -1 ? id0 : id0.substring(0, start)
    const category = params.category
    const isPerson = params.isPerson === undefined ? true : params.isPerson !== "false"

    log("wiki2card: params ", params, "name", name, "isPerson", isPerson)

    let wikitext = ""
    let error = undefined
    try {
        wikitext = await getWikiTextForName(name)
    } catch (e) {
        error = e
    }
    if (!wikitext) {
        res.status(404).json({notFound: id0, error})
    } else {
        let img = undefined
        try {
            img = await getImageForName(name)
        } catch (e) {
            log("cannot get image for ", name, ": ", e)
        }

        const moreData = {...parseWikiText(name, isPerson, wikitext, category), img}

        await saveObj(moreData, isPerson)

        res.status(200).json(moreData)
    }
}
