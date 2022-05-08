import path from "path"
import fs from "fs"
import {debug, log} from "../../../src/utils"
import {fetchSingleCat} from "../../../src/server/fetchWikiApi"

const txtPath = path.resolve('./public', 'static', 'objects.json')
const objectsTxt = fs.readFileSync(txtPath, 'utf-8')
export const objectWikiText: string = function () {
    try {
        const objectsJson = JSON.parse(objectsTxt)
        const o = objectsJson.query.pages
        const p = o[Object.keys(o)[0]].revisions[0]["*"]
        return p
    } catch (e) {
        log("error parsing object.json", e)
        return ""
    }
}()

export function parseListPage(objectWikiText) {
    // https://regex101.com/r/4EmtNF/1
    const objectInventionRegex = new RegExp(/^\*\s*([^\:]*)\:[^\[]*\[\[([^\]]+)\]\]/gm)

    // https://regex101.com/r/KjqCz3/1
    const objectInventionByRegex = new RegExp(
        /^\*\s*([^\:]*)\:[^\[]*\[\[([^\]]+)\]\][^(invents|builds|patent|presents|\[)]*(invents|builds|patent|presents)[^\[]*\[\[(.*?)\]\].*$/gm)

    const lines = objectWikiText.replace(/\r/g, "").split("\n")
        .filter(x => x.startsWith("*"))
        .map(x => {
            let m = objectInventionByRegex.exec(x)
            if (m)
                return {year: m[1], object: m[4], by: m[2]}

            m = objectInventionRegex.exec(x)
            if (m)
                return {year: m[1], object: m[2]}
        })
        .map((x, i) => x && ({
            ...x,
            i,
            yearNum: parseFloat(x.year),
            object: x.object.substring(x.object.indexOf('|') + 1)
        }))
        .filter(x => x && x.yearNum <= 1900)
    return lines
}

export default async function handler(req, res) {
    const arr = []
    const whenDone = () => {
        debug(" done! ")
        res.status(200).json(arr)
    }
    const withCat = name => {
        debug(" got cat " + name)
        arr.push({category: true, name})
    }
    const withItem = name => {
        debug(" got item " + name)
        arr.push({category: false, name})
    }
    let c = "Category:Hungarian inventions"
    c = "Category:Inventions_by_country"

    debug("researching " + c)

    await fetchSingleCat(c, withCat, withItem, whenDone)
}
