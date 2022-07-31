import {debug} from "../../../src/utils"


const textApiUrl = x =>
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=600&explaintext=&format=json&titles=" + x

const wikitextApiUrl = x =>
    "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvslots=%2A&rvprop=content"
    + "&formatversion=2&format=json&format=json&titles=" + encodeURIComponent(x)

const getImages = x => "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&titles=" + x

const getUrl = x => "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo"
    + "&iiprop=url&format=json&titles=File:" + x

export async function getImageForName(name: string): Promise<string> {
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

export async function getWikiParaForName(name: string): Promise<string> {
    const json = await fetch(textApiUrl(name)).then(x => x.json())
    const k = Object.keys(json.query.pages)[0]
    return json.query.pages[k].extract
}

export async function getWikiTextForName(name: string): Promise<string> {
    let url = wikitextApiUrl(name.trim())
    // debug("getWikiTextForName url ", name, "=>", url)
    const json = await fetch(url).then(x => x.json())
    const k = json.query?.pages && json.query.pages[0]
    // debug("getWikiTextForName", name, k)
    return k?.revisions && k?.revisions[0]?.slots?.main?.content
}

export default async (req, res) => {
    const id0 = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const start = id0.indexOf("?")
    const id = start === -1 ? id0 : id0.substring(0, start)
    const param = id0.substring(start + 1)
    debug("id", id, "id0", id0, "start", start, "param", param)
    if (param === "wikitext") {
        const wikitext = await getWikiTextForName(id)
        res.status(200).json({wikitext})
    } else {
        const para = await getWikiParaForName(id)
        res.status(200).json({para})
    }
}
