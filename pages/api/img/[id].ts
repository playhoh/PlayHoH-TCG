import {splitIntoBox} from "../measureText"
import {empty, fromBase64, log, repeat} from "../../../src/utils"
import {cardTemplateSvg} from "../../../src/server/staticData"
import {getNiceCardUrl} from "../../../src/cardData"
import {findSomeCard} from "../cards/all"
import {replaceCardText} from "../../../src/server/cardLookup"
import {moralisSetup} from "../../../src/baseApi"
import Moralis from "moralis/node"

// https://graphicdesign.stackexchange.com/a/5167
export async function withSvg(query, b64) {
    let card = undefined
    let b64res = ""
    if (b64) {
        try {
            b64res = fromBase64(b64)
            card = JSON.parse(b64res)
            card = replaceCardText(card)
            log("card", card)
        } catch (e) {
            log("svg for base64 error: " + e + ", b64res was ", b64res)
        }
    }

    if (!card) {
        const cards = await findSomeCard(query, true)
        if (!cards || !cards[0])
            return

        card = replaceCardText(cards[0])
    }

    //const isObject = card.superType === 'Object'
    //const isArchetype = card.superType === 'Archetype'
    //  debug("card", card)
    const imageBase64 = card.img

    let url = ""
    if (card.preview) {
        card.text = ""
        url = getNiceCardUrl(card.key || "")
        // anglicize(card.name).replace(" ", "_")
        card.power = undefined
        card.wits = undefined
        card.cost = 0
    }

    const paramW = 0
    const paramP = 0

    let content = cardTemplateSvg
        .replace('$NAME$', card.displayName || card.name || "")
        .replace('$IMAGE$', imageBase64)
        .replace('$TYPE$', card.typeLine || "")
        .replace('$S$', card.key || "")
        .replace('$URL$', url)
        .replace('$FLAVOR$', card.flavour || "")
        .replace("$B$", empty(card.wits) ? "" : (parseFloat(card.wits.toString()) + paramW).toString())
        .replace("$P$", empty(card.power) ? "" : (parseFloat(card.power.toString()) + paramP).toString())

    if (card.imgPos) {
        // https://regex101.com/r/5BaNmf/1
        content = content.replace(/height="52"\s+preserveAspectRatio="xMidYMin /gm,
            "height=\"70\" preserveAspectRatio=\"" + card.imgPos + " ",)
    }

    if (card.typeLine?.includes("Object"))
        content = content
            .replace(/ac9393/g, "aca3b3")
            .replace(/483737/g, "485767")
            .replace(/6c5353/g, "93a8b9")

    if (card.typeLine?.includes("Archetype"))
        content = content
            .replace(/ac9393/g, "2131333")
            .replace(/483737/g, "283737")
            .replace(/6c5353/g, "233839")

    if (empty(card.wits))
        content = content.replace(/id="BRAIN" style="/g, "id=\"BRAIN\" style=\"opacity: 0;")
    if (empty(card.power))
        content = content.replace(/id="PHYS" style="/g, "id=\"PHYS\" style=\"opacity: 0;")

    //    .replace("$TEXT1$", card.text)

    /*if (card.cost < 4)
        content = content.replace("fill-opacity:1\" id=\"C4\"", "fill-opacity:0; opacity: 0\" id=\"C4\"")
    if (card.cost < 3)
        content = content.replace("fill-opacity:1\" id=\"C3\"", "fill-opacity:0; opacity: 0\" id=\"C3\"")
    if (card.cost < 2)
        content = content.replace("fill-opacity:1\" id=\"C2\"", "fill-opacity:0; opacity: 0\" id=\"C2\"")
    if (card.cost < 1)
        content = content.replace("fill-opacity:1\" id=\"C1\"", "fill-opacity:0; opacity: 0\" id=\"C1\"")
    */

    const costSymbols = repeat(card.cost, "△").join("")
    content = content.replace("$COST$", costSymbols)

    const text = (card.text ?? "").replace(/\\n/g, "\n")

    const arr = splitIntoBox(text).map(x => x.text).filter(x => x)
    if (arr.length == 1) {
        arr[1] = arr[0]
        arr[0] = ""
    }
    if (arr.length == 2) {
        arr[2] = arr[1]
        arr[1] = arr[0]
        arr[0] = ""
    }
    for (let i = 1; i <= 4; i++) {
        const text = arr[i - 1]?.trim() ?? ""
        content = content.replace("$TEXT" + i + "$", text)
    }

    return content
}

export const svgMap = {}
export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const b64 = id.startsWith("b64-") ? id.substring(4) : undefined
    let toUpperCase = id.toUpperCase()
    try {
        moralisSetup(true, Moralis)
        const replaced = (!b64 && svgMap[id]) ?? await withSvg(q => {
            q.equalTo('key', '#' + toUpperCase)
            q.limit(1)
        }, b64)
        res.setHeader('Content-Type', 'image/svg+xml')
        if (replaced) {
            if (!b64)
                svgMap[id] = replaced
            res.status(200)
            res.end(replaced)
        } else {
            log("/img/[id] not found: " + toUpperCase)
            res.redirect("/static/card-back.svg")
        }
    } catch
        (err) {
        res.status(404)
        res.json({notFound: id, error: err.toString()})
    }
}
