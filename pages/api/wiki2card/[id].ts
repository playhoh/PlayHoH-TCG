import {debug, log} from "../../../src/utils"
import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/client/baseApi"
import {getImageForName, getWikiTextForName} from "../../../src/server/cardLookup"
import {parseWikiText} from "../../../src/wikiApi"

async function saveObj(moreData) {
    moralisSetup(false, Moralis)

    const {name, typeLine} = moreData

    const isPerson = !typeLine?.includes("Object")

    const WikiPerson = Moralis.Object.extend("WikiPerson")
    const WikiObject = Moralis.Object.extend("WikiObject")
    const classObj = isPerson ? WikiPerson : WikiObject
    const query = new Moralis.Query(classObj)
    query.equalTo("name", name)

    const results = await query.find()
    console.log("results wiki2card", results)

    if (results.length > 0) {
        const item = results[0]
        item.set("name", name)
        item.set('data', moreData)

        try {
            await item.save()
            debug("saved moreData in " + name)
        } catch (e) {
            log("error saving in wiki2card", name, moreData)
        }
    }
}

// https://github.com/spencermountain/wtf_wikipedia
export default async (req, res) => {
    const id0 = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const start = id0.indexOf("?")
    const name = start === -1 ? id0 : id0.substring(0, start)
    const category = start === -1 ? undefined : id0.substring(start + 1)

    let wikitext = ""
    let error = undefined
    try {
        wikitext = await getWikiTextForName(name)
    } catch (e) {
        error = e
    }
    const isPerson = true // TODO isPerson
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

        await saveObj(moreData)

        res.status(200).json(moreData)
    }
}
