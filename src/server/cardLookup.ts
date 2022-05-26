import fetch from 'isomorphic-fetch'
import {buildCardFromWiki, buildTextFor} from "../cardCreation"
import {beta1Json, beta2Json, personJson} from "./personJson"
import {debug} from "../utils"
import {parseWikiText} from "../wikiApi"
import Moralis from "moralis/node"
import {moralisSetup} from "../client/baseApi"
import {effects, effectsForTypes, effectsTypeForCategory} from "../../pages/api/effects"
import {CardData, EffectsData} from "../../interfaces/cardTypes"

export const serverEffectsData: EffectsData = {
    effectsForTypes, effects, effectsTypeForCategory
}

export async function getImageForName(name: string): Promise<string> {
    const getImages = x => "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&titles=" + x
    const getUrl = x => "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=File:" + x
    const res = await fetch(getImages(name)).then(x => x.json())

    const x = res.query.pages
    const key = Object.keys(x)[0]
    const thumb = x[key].thumbnail?.source
    if (thumb) {
        const lastSlash = thumb.lastIndexOf('/')
        const px = thumb.indexOf('px', lastSlash)
        return thumb.substring(0, lastSlash + 1) + "500" + thumb.substring(px)
    } else {
        const img = x[key].pageimage
        if (img) {
            const res2 = await fetch(getUrl(img)).then(x => x.json())
            const p = res2.query.pages
            const key = Object.keys(p)[0]
            const url = p[key]?.imageinfo[0]?.url
            if (url) {
                return url
            }
        }
    }
    return ""
}

const textApiUrl = x =>
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=600&explaintext=&format=json&titles=" + x

const wikitextApiUrl = x =>
    "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvslots=%2A&rvprop=content&formatversion=2&format=json&format=json&titles=" + encodeURIComponent(x)

export async function getWikiParaForName(name: string): Promise<string> {
    const json = await fetch(textApiUrl(name)).then(x => x.json())
    const k = Object.keys(json.query.pages)[0]
    return json.query.pages[k].extract
}

export async function getWikiTextForName(name: string): Promise<string> {
    let url = wikitextApiUrl(name.trim())
    debug("getWikiTextForName url ", name, "=>", url)
    const json = await fetch(url).then(x => x.json())
    const k = json.query?.pages && json.query.pages[0]
    debug("getWikiTextForName", name, k)
    return k?.revisions && k?.revisions[0]?.slots?.main?.content
}

// http://localhost:3000/api/svg/Richard_Strauss
// composer

// const bigR = '<tspan style="font-size: 200%">࿋</tspan>'

export function cleanCard(card: CardData): CardData {
    //const pluralTypes = card?.displayType + "s"
    card.text = card?.text
        //  ?.replace(/<TYPE_PL>/g, pluralTypes)
        ?.replace(/\[R\]/g, "△") // "࿋")
        ?.replace(/\[P\]/g, "✊") // "💪")
        ?.replace(/\[W\]/g, "⌾") // "👁")
        ?.replace(/\[_\]/g, "■")
    card.info = undefined
    return card
}

export async function getCardForId(id0: string | number): Promise<CardData> {
    const parts = id0.toString().split("?")
    const id = parts[0]
    // TODO not needed here afaik... const rest = parts[1] || ""

    const predefined = [beta1Json, beta2Json]
    for (let i = 0; i < predefined.length; i++) {
        const orLookup = predefined[i].find(x => x.name === id)
        if (orLookup)
            return cleanCard(orLookup)
    }

    let intId = -1
    try {
        intId = parseInt(id)
    } catch {
    }

    /*let newMode=false
    if(intId < 0)
    {
        intId=-intId
    }*/

    let cleanName = id.replace(/\+/g, ' ')
    const underscoreName = id.replace(/[+_ ]/g, '_')
    let foundPerson = undefined
    // .filter(x => x.img)
    if (intId >= 0) {
        /*for (let i = intId; i < personJson?.length; i++) {
            foundPerson = personJson ? personJson[i] : undefined
            if (foundPerson)
                break
        }*/
        foundPerson = personJson ? personJson[intId] : undefined
        const arr = foundPerson?.names?.split(' ') || [""]
        if (foundPerson)
            cleanName = (arr[1] || arr[0] || "").replace(/_/g, ' ')

    } else {
        intId = personJson?.findIndex(x => x.names.includes(underscoreName))
        foundPerson = personJson[intId]
    }
    // console.log("foundPerson: " + underscoreName + " => " + JSON.stringify(foundPerson))

    // req.url.pathname.substring(1)

    const wikiName = cleanName.replace(/_/g, "+")
    const displayType = foundPerson?.type?.replace(/_/g, " ") ?? ""

    const year = foundPerson?.year ?? ""
    const typeLine = "Person - " + displayType.substring(0, 1).toUpperCase() + displayType.substring(1)

    // foundPerson?.info // || (wikiName === "" ? "" : await getWikiParaForName(wikiName))
    //let img =
    //  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Man_in_hood_stretching_hand_%28Unsplash%29.jpg/120px-Man_in_hood_stretching_hand_%28Unsplash%29.jpg"

    //try {
    // const img = foundPerson?.img
    //wikiName === "" ? "" : await getImageForName(wikiName)
    // if (betterImg) {
    //img = betterImg
    //    console.log("img for " + cleanName + " is " + img)
    // }

    //} catch {
    //}
    const text = buildTextFor(serverEffectsData)(displayType, intId)
    const phys = wikiName.length % 2 === 0 ? 1 : 2
    const wits = wikiName.length % 3 === 0 ? 1 : 2
    const cost = 1 + (wikiName.length % 3)
    return cleanCard({
        name: cleanName,
        text,
        typeLine,
        id,
        set: intId === -1 ? "?" : "G" + intId,
        // brain, phys,
        phys, wits,
        cost,
        flavor: year
    })
}

async function findWikiItem(name) {
    moralisSetup(false, Moralis)

    const WikiPerson = Moralis.Object.extend("WikiPerson")
    const WikiObject = Moralis.Object.extend("WikiObject")

    function q(isPerson) {
        const classObj = isPerson ? WikiPerson : WikiObject
        const query = new Moralis.Query(classObj)
        query.exists("data")
        query.exists("data.img")
        query.notEqualTo("data.img", "")
        query.equalTo("name", name)
        return query
    }

    let x = await q(true).first()
    if (!x)
        x = await q(false).first()

    if (!x)
        return

    const name2 = x.get('name')
    const data = x.get('data')
    const t = x.className
    // debug("j", JSON.stringify(x))
    const img = x.get('img')?.url() || data.img
    const isPerson = t === "WikiPerson"
    const cardData = x.get('cardData')
    return {name: name2, data, img, t, isPerson, cardData}
}

export async function getWikiCardForId(id0: string): Promise<CardData> {
    const parts = id0.split("?")
    const id = parts[0]

    const foundItem = await findWikiItem(id)
    // debug("wikiForCardId", id, "=>", foundItem)

    if (!foundItem)
        return

    if (foundItem.cardData)
        return cleanCard({...foundItem.cardData, name: foundItem.cardData.displayName})
    else {
        const dataParsed =
            {
                ...parseWikiText(foundItem.name, foundItem.isPerson, foundItem.data.wikitext, foundItem.data.category),
                img: foundItem.img || foundItem.data.img
            }
        const res = buildCardFromWiki(serverEffectsData)(dataParsed)
        return cleanCard(res)
    }
}
