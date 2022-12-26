import {
    cardTextBoxWidthSVG,
    cardTextFontSizeSVG,
    debug,
    empty,
    escapeSql,
    fromBase64,
    isProduction,
    log,
    parseNum,
    parseUrlParams,
    repeat,
    toBase64FromBuffer,
    toBase64FromUrl
} from "../../../src/utils"
import {ArchetypeImage, cardTemplateSvg, getFileContentBuffer, ManInHoodImage} from "../../../src/server/staticData"
import {getNiceCardUrl} from "../../../src/cardData"
import {findSomeCard, replaceCardText} from "../../../src/server/cardLookup"
import {moralisSetup} from "../../../src/baseApi"
import {splitIntoBox} from "../../../src/measureText"
import {startupMessage} from "../track"
import {NextApiRequest, NextApiResponse} from "next"
import {ApiServer} from "../../../src/server/ApiServer"

class ErrorWithData extends Error {
    public data: any = undefined

    constructor(message, data) {
        super(message)
        this.data = data
    }
}

function getLegacyImage(card) {
    const folder = card.typeLine?.startsWith('Object') ? 'obj' : 'img'
    const file = card.name?.replace(/ /g, "_") + '.jpg'
    const fileContentBuffer = getFileContentBuffer(folder, file)
    return toBase64FromBuffer(fileContentBuffer)
}

// https://graphicdesign.stackexchange.com/a/5167
export async function withSvg(queryFun: (x: any) => void, b64: string, info: string, params?: any, potentiallyName?: string, imgOverride?: string) {
    let card = undefined
    let b64res = ""
    if (b64) {
        try {
            //log("b641", card)
            b64res = fromBase64(b64)
            //log("b642", card)
            card = JSON.parse(b64res)
            //log("b643", card)
            card = replaceCardText(card)
            //log("card", card)
        } catch (e) {
            const x = "svg for base64 error: " + e + ", b64res was "
            log("x", x)
            throw new ErrorWithData(x, b64res)
        }
    }
    //debug("a")

    if (!card || card?.img === "from-db") {
        if (card?.img === "from-db") {
            queryFun = q => {
                q.equalTo('key', card.key)
                q.limit(1)
                // log("q", q)
            }
        }

        const cards = await findSomeCard(queryFun, true, undefined, potentiallyName)
        if (!cards || !cards[0]) {
            log("not found")
            throw new ErrorWithData("not found", info)
        }

        // log("found card for ", info, ":", cards[0])

        if (card?.img === "from-db")
            card.img = cards[0].img
        else
            card = replaceCardText(cards[0])

        //debug("found img for item, len:", card.img?.length)
    }

    //const isObject = card.superType === 'Object'
    //const isArchetype = card.superType === 'Archetype'
    //  debug("card", card)
    const imageBase64 =
        imgOverride
        || (card.typeLine?.includes("Archetype")
            ? toBase64FromBuffer(ArchetypeImage)
            : card.img?.startsWith("http")
                ? await toBase64FromUrl(card.img, ManInHoodImage)
                : card.legacy
                    ? getLegacyImage(card)
                    : card.img)

    let url = ""
    if (params?.n) {
        card.text = ""
        url = getNiceCardUrl(card.key || "")
        // anglicize(card.name).replace(" ", "_")
        card.power = undefined
        card.wits = undefined
        card.cost = 0
    }

    const paramW = parseNum(params?.w) || 0
    const paramP = parseNum(params?.p) || 0
    // debug("params w", paramW, ", p", paramP, params)
    let content = cardTemplateSvg
        .replace('$NAME$', card.displayName || card.name || "")
        .replace('$IMAGE$', imageBase64)
        .replace('$TYPE$', card.typeLine || "")
        .replace('$S$', card.key || "")
        .replace('$URL$', url)
        .replace('$FLAVOR$', card.flavour || "")
        .replace("$B$", empty(card.wits) ? "" : (parseFloat(card.wits + "") + paramW).toString())
        .replace("$P$", empty(card.power) ? "" : (parseFloat(card.power + "") + paramP).toString())

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
            .replace(/ac9393/g, "213133")
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

    const arr = splitIntoBox(text, cardTextFontSizeSVG, cardTextBoxWidthSVG).map(x => x.text).filter(x => x)
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

export async function getImgRoute(req, res) {
    const id0 = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const b64 = id0.startsWith("b64-") ? id0.substring(4).replace(/_/g, "/") : undefined

    const parts = id0.split("?")
    const potentiallyName = parts[0]
    // const toUpperCase = potentiallyName //?.toUpperCase() || ""
    const rest = parts[1] || ""
    const params = parseUrlParams("?" + rest)

    try {
        moralisSetup(true)
        let noCache = params.nc
        const alreadyThere = (b64 || noCache) ? undefined : svgMap[id0]

        const replaced = alreadyThere ??
            await withSvg(q => {
                //q.equalTo('key', '#' + toUpperCase)
                q.equalTo("name", potentiallyName)
                q.limit(1)
            }, b64, b64 ? "base 64 data" : params, potentiallyName)

        if (!noCache && !b64 && !alreadyThere && isProduction)
            svgMap[id0] = replaced

        res.setHeader('Content-Type', 'image/svg+xml')
        res.status(200)
        res.end(replaced)

    } catch (err) {
        log("err", err)
        res.status(err.data ? 400 : 404)
        res.json(err.data ? {error: err.message, data: err.data} : {
            notFound: potentiallyName,
            error: err.toString(),
            params
        })
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    const params = parseUrlParams("?" + search)
    let id0 = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const id = id0.split("?")[0].replace(/&apos;/g, "'")

    let noCache = params.nc
    const alreadyThere = noCache ? undefined : svgMap[id0]
    if (alreadyThere)
        res.status(200).end(alreadyThere)
    else {
        //console.log("img for ", id)
        //await getImgRoute(req, res)
        const res2 = await ApiServer.runStatement(`select img from hoh_img where name="${escapeSql(id)}" limit 1`, params.debug)
        //const res2 = [] // TODO v2
        let img = res2[0]?.img
        console.log("img for ", id, " is ", img?.length)
        //if (img) {

        ApiServer.init()

        const svg = await withSvg(x => {
            x.equalTo("name", id)
            //console.log(x, x.equalTo, x.where, x.toSql())
        }, "", id, undefined, undefined, img) // "data:image/jpeg;base64," +

        svgMap[id0] = svg

        res.setHeader('Content-Type', 'image/svg+xml')
        res.status(200)
        res.end(svg)
        //} else
        //  res.status(404).send({notFound: id})
    }
}

// pasting it here because we have cards all the time
try {
    startupMessage()
} catch (e) {
    debug("startupMessage error ", e)
}
