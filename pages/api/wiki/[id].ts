import {debug} from "../../../src/utils"
import {getWikiParaForName, getWikiTextForName} from "../../../src/server/cardLookup"

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
