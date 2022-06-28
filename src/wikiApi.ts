import type {Maybe} from "../interfaces/baseTypes"
import {WikiData} from "../interfaces/wikiTypes"
import {capitalize} from "./utils"

export const birthsCat = "Category:Births_by_decade"

export const getCatmembersUrl = name =>
    "https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmlimit=500&cmtitle=" + name.replace(":", "%3A")

export const apiUrl = x =>
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=400&explaintext=&titles=" + x + "&format=json"

const stripAfterLen = 14
const stripAfter = [
    ". ", ", ", " who ",
    " rich in", " composed of ", " that ", " containing ", " with ",
    " for", " and ", "of the ", "driven by ", " to transport ", " built by ",
    " probably ", " from ", " found in ", " designed ", "for "
]
const textStripAfter =
    ["was a ", "was an ", "is a ", "is an "]

// https://regex101.com/r/pZwv6W/1
const categoriesRegex = new RegExp(/\[\[Category:([^\]|]+)\|?[^\]]*\]\]/g)

export function extractCategoriesFromWikitext(wikitext) {
    const res = categoriesRegex.exec(wikitext)
    if (res)
        return res[1]
}


// TODO consider wtf_wikipedia parser
// import wtf from 'wtf_wikipedia'
/*
const doc = wtf.fetch(name)
let test = doc?.infobox()?.get('Short description')?.text()
test.text()s
res.status(200).json({test, name})
*/

// https://regex101.com/r/TRxQUR/1
function removeWikiLinks(typeLine) {
    return typeLine?.replace(new RegExp(/\[\[[^|]+\|([^\]]*)\]\]/g), "$1")
}

function firstCapture(text, regExps) {
    return regExps.map(regex =>
        (regex.exec(text) || [])[1]?.trim()
    ).find(x => x)
}

function getYearFromCategory(wikitext) {
    return firstCapture(wikitext, [
        /.*\[\[Category:([0-9]+[a-z][a-z]-(century|millenium)\s*B?C?).*\]\].*/,
        /.*\[\[Category:([0-9]+\s*B?C?).*\]\].*/
    ])
}

// https://regex101.com/r/PnHvmD/1
function extractDate(year) {
    return !year ? year :
        year.toLowerCase()?.includes("circa")
            ? year.replace(/[\{\}]/g, "").replace("|", " ")
            : firstCapture(year,
                [
                    /\{.*?[^\|]+\|([0-9]+\|[0-9]+\|[0-9]+).*/,
                    /.*?\|([0-9]+)\}.*/,
                    /.*?([A-Za-z]+ [0-9]+, [0-9]+).*/,
                    /.*?([A-Za-z]+. [0-9]+).*/,
                    /.*?([0-9]+).*/
                ]
            )?.replace(/\|/g, "/")
}

function getYearFromWikiText(firstText: string): Maybe<string> {
    const res = new RegExp(/\((.*?\))/).exec(firstText)
    if (res) {
        let s = res[0]?.replace(/[\(\)]/g, "")
            .replace("&ndash;", "-")
            .replace(/[\[\]]/g, "")

        if (s.match(/[0-9]/))
            return extractDate(s)
    }
}

function getYearFromParentheses(text: string): Maybe<string> {
    const res = /.*?\(.*?[^0-9]?([0-9]+)[^0-9]?.*?\)?.*/.exec(text) || []
    // debug(text, "=year regex=>", res[1], "X", extractDate(res[1]))

    if (res[1])
        return extractDate(res[1]) || res[1]
}

function getYearFromInfo(infoBox: string[]): string {
    let candidates = infoBox.filter(x =>
        x.toLowerCase().includes("birth_date")
        || x.toLowerCase().includes("ship launched")
        || x.toLowerCase().includes("discovery_date")
        //|| x.toLowerCase().includes("year")
        || x.toLowerCase().includes("pub_date")
    )
    let year = candidates.map(x => extractDate(x.substring(x.indexOf("=") + 1).trim())).find(x => x) || ""

    // debug("year2", year, "info", infoBox, "cand", candidates)

    let deathDate = infoBox.find(x => x.toLowerCase().includes("death_date"))
    if (deathDate)
        deathDate = deathDate.substring(deathDate.indexOf("=") + 1).trim()
    const end = extractDate(deathDate)
    if (end)
        year = (year ? year + " - " : "") + end

    return year
}

function clean(str) {
    return typeof str === "string"
        ? str.replace(/</g, "‹")
            .replace(/>/g, "›")
            .replace(/&ndash;/g, "-")
            .replace(/&/g, "+")
        : str
}

function cleanYear(year) {
    let idx = year?.indexOf('<')
    if (idx >= 0)
        year = year.substring(0, idx)

    idx = year?.indexOf(';')
    if (idx >= 0)
        year = year.substring(0, idx)
    return year
}

export function parseWikiText(name, isPerson, wikitext, category?: string, img2?: string): WikiData {
    name = name?.trim()
    const lines =
        wikitext
            .replace("}}{{", "}}\n{{")
            .split("\n")
            .map(x => x.trim())

    const infoBox = lines.filter(x => x.startsWith("|") || x.startsWith("{") && !x.includes("|date=")
        && !x.includes("reflist"))
    const textArr = lines.filter(x => !x.startsWith("|") && !x.startsWith("{") && !x.startsWith("}"))

    //debug("infoBox", infoBox)
    //debug("textArr", textArr)

    let infoBox1 = infoBox[0]
    let short = infoBox1?.split("|")[1]?.replace(/\}/g, "") || ""
    if (infoBox1?.includes("{{inline|") || infoBox1?.includes("{{For|") || infoBox1?.includes("{{Infobox")
        || infoBox1?.includes("|date=")
        || short.includes("="))
        short = ""

    let idx = short?.indexOf("(")

    const firstText = textArr.find(x => x.includes("was ") || x.includes("is ")) || textArr[0]
    //debug("typeLine3", typeLine, "firstText", firstText)

    //debug("typeLine1", typeLine)
    let years: WikiData['years'] =
        {
            info: getYearFromInfo(infoBox),
            name: getYearFromParentheses(name),
            text: getYearFromWikiText(firstText),
            firstText: getYearFromParentheses(short?.substring(idx)),
            category: getYearFromCategory(wikitext)
        }

    let year =
        Object.keys(years)
            .map(key => years[key] = cleanYear(years[key]))
            .map(key => years[key])
            .find(x => x)

    // debug("year3", year)

    // debug("firstText", firstText, "year strat", "info", getYearFromInfo(infoBox), "text:", getYearFromWikiText(firstText), "title", getYearFromParentheses(name), "sh", getYearFromParentheses(short?.substring(idx)), "cat:", getYearFromCategory(wikitext))

    idx = -1
    let typeLines: WikiData['typeLines'] = {}

    typeLines.name = name.includes("ship)") || name.includes("HMS") ? "Ship" : undefined
    typeLines.text = wikitext.includes("Infobox book") ? "Book" : undefined

    typeLines.parenShort = idx === -1 ? short : short?.substring(0, idx)?.trim()

    const title = infoBox.find(x => x.match("\s*|\s*title\s*="))
    if (title) {
        typeLines.title = removeWikiLinks(title.split("=")[1]?.trim())
    }
    //debug("typeLine2", typeLine)

    const succession = infoBox.find(x => x.match("\s*|\s*succession\s*="))
    if (succession) {
        typeLines.succession = removeWikiLinks(title.split("=")[1]?.trim())
    }

    if (firstText) {
        textStripAfter.forEach(x => {
            idx = firstText.indexOf(x)
            typeLines.firstText = idx === -1 ? typeLines.firstText : firstText.substring(idx + x.length)
        })
    }


    typeLines.text = typeLines.firstText
    Object.keys(typeLines).map(key => {
        let str = typeLines[key]
        if (str?.length > stripAfterLen) {
            stripAfter.forEach(x => {
                const idx = str.indexOf(x)
                if (idx >= 0) {
                    str = str.substring(0, idx)
                    str = removeWikiLinks(str).trim()
                    str = str.replace(/[\[\]\.]/g, "")
                    str = str.replace("Category:", "")
                    str = capitalize(str)
                    typeLines[key + "_" + x.replace(/\./g, "DOT").trim()] = str
                }
            })
        }
    })
    // debug("typeLine4", typeLine, "l", typeLine?.length)

    let typeLine = Object.keys(typeLines).map(x => typeLines[x]).find(x => x)

    const firstName = name.split(/[, ]/)[0]

    const extracted = extractCategoriesFromWikitext(wikitext)
    category = category || extracted

    const categories: WikiData['categories'] = {}
    if (category)
        categories.fromParent = category
    if (extracted)
        categories.extracted = extracted

    let result = {
        name,
        displayName: name,
        displayNames: name.split(" ").map(x => name.substring(0, name.indexOf(x)) + x),
        isPerson,
        firstName,
        wikitext,
        typeLine,
        year,
        category,
        years,
        typeLines,
        categories
    } as WikiData

    if (!isPerson)
        delete result.firstName
    Object.keys(result).forEach(x => result[x] = clean(result[x]))
    return result
}