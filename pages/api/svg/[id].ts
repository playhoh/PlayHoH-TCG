import {splitIntoBox} from "../measureText"
import {debug, fromBase64, log, repeat, toBase64} from "../../../src/utils"
import {cleanCard, getCardForId, getWikiCardForId, isCardId} from "../../../src/server/cardLookup"
import {startupMessage} from "../tracking/[id]"
import {cardTemplateSvg, getFileContentBuffer, ManInHoodImage} from "../../../src/server/staticData"
import {getNiceCardUrl} from "../../../src/cardData"

export const svgCache = {}

function toBase64Img2(name: string, obj: boolean) {
    let res = ManInHoodImage
    let folder = obj ? 'obj' : 'img'
    const imgPath = name + '.jpg'
    try {
        res = getFileContentBuffer(folder, imgPath)
    } catch {
        debug("No img for: " + folder + "/" + imgPath + ", using default, obj:" + obj)
    }
    return toBase64FromBuffer(res)
}

export function toBase64FromBuffer(buffer: ArrayBuffer | Buffer) {
    const base64String = toBase64(buffer)
    return "data:image/jpeg;base64," + base64String
}

export const cardBoxWidth = 180

function getParam(key: string, query: string, mode?: string) {
    const idx = query.indexOf(key + "=")
    if (idx >= 0) {
        const after = query.substring(idx + key.length + 1)
        const part = after.split("&")[0]
        const asString = mode === "str"
        const res = asString ? part : parseFloat(part)
        return asString ? res : res < 0 || res > 3 ? 0 : res
        // TODO: think about it, maybe its ok to do this sanity check to save server caching
    }
    return 0
}

// with font and image embedded with base64
async function toBase64FromUrl(img: string) {
    let res: ArrayBuffer | Buffer = ManInHoodImage
    try {
        res = await fetch(img).then(x => x.arrayBuffer())
    } catch (e) {
        debug("Error fetching img " + e.toString())
    }
    return toBase64FromBuffer(res)
}

// https://graphicdesign.stackexchange.com/a/5167
export async function getSVGForNameOrId(id0) {
    const parts = id0.split("?")
    const id = parts[0]
    const rest = parts[1] || ""
    const paramW = getParam("w", rest) as number
    const paramP = getParam("p", rest) as number
    const paramS = getParam("s", rest) as number
    const paramN = getParam("n", rest) as number
    const paramD = getParam("d", rest, "str")

    debug("api/svg => id0", id0, "p", paramP, "w", paramW, "d", paramD, "n", paramN, "s", paramS)

    let card = undefined
    let b64res = ""
    if (paramD) {
        try {
            b64res = fromBase64(paramD)
            card = JSON.parse(b64res)
            card = cleanCard(card)
        } catch (e) {
            log("svg for base64 error: ", e.toString(), "b64res was ", b64res)
        }
    }

    let genericImg = paramN === 1
    let isWikiCard = paramS === 1
    const underscoredName = id.replace(/[+ _]/g, "_")
    const isId = isCardId(id)
    if (!card) {
        const spaceName = id.replace(/[+ _]/g, " ")

        // debug("getSVGForNameOrId", id0, ",", id, "s", paramS)

        const old = svgCache[id0]
        if (old && process.env.NODE_ENV !== "development")
            return old

        card = (isWikiCard || genericImg)
            ? await getWikiCardForId(spaceName)
            : await getCardForId(spaceName)

        if (!card)
            return
    }
    // console.log("card for " + id + " is " + JSON.stringify(card))

    const empty = x => x === "" || x === undefined

    const isObject = card.typeLine?.includes('Object')
    const isArchetype = card.typeLine?.includes('Archetype')

    const imageBase64 =
        isArchetype ? toBase64Img2("Archetype", false)
            : (isWikiCard || paramD || genericImg || isId)
                ? await toBase64FromUrl(card.img)
                : !card.name ? "" : toBase64Img2(underscoredName, isObject)

    let url = ""
    if (genericImg) {
        card.text = ""
        url = getNiceCardUrl(card.set)
        // anglicize(card.name).replace(" ", "_")
        card.phys = ""
        card.wits = ""
        card.cost = 0
    }

    let content = cardTemplateSvg
        .replace('$NAME$', card.displayName || card.name || "")
        .replace('$IMAGE$', imageBase64)
        .replace('$TYPE$', card.typeLine || "")
        .replace('$S$', card.set || "")
        .replace('$URL$', url)
        .replace('$FLAVOR$', card.flavor || "")
        .replace("$B$", empty(card.wits) ? "" : (parseFloat(card.wits.toString()) + paramW).toString())
        .replace("$P$", empty(card.phys) ? "" : (parseFloat(card.phys.toString()) + paramP).toString())

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
    if (empty(card.phys))
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

    const arr = splitIntoBox(text, 12, cardBoxWidth).map(x => x.text).filter(x => x)
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

    svgCache[id0] = content
    return content
}

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    try {
        const replaced = await getSVGForNameOrId(id)
        if (replaced) {
            res.setHeader('Content-Type', 'image/svg+xml')
            res.status(200)
            res.end(replaced)
        } else {
            res.status(404)
            res.json({notFound: id})
        }
    } catch (e) {
        log(e)
        res.status(404)
        res.json({error: e})
    }
}

// pasting it here because we have cards all the time
try {
    startupMessage()
} catch (e) {
    debug("startupMessage error ", e)
}


