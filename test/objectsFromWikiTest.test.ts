import {getCatmembersUrl} from "../src/wikiApi"
import {debug, log, tempSeed, xmur3} from "../src/utils"
import {getImageForName, getWikiTextForName} from "../src/server/cardLookup"
import fs from "fs"
import {createItem} from "../pages/api/wiki-category/[id]"
import Moralis from "moralis/node"
import {moralisSetup} from "../src/baseApi"
import {testMode} from "../src/testUtils"

/** 1900-2022 */
const skipYears =
    Array.from({length: 123}).map((x, i) => (1900 + i).toString())

const skipMe =
    ["astronomical objects", "hospitals", "constellation", "taxa", "robot", "category:fellows of", "video game",
        "disaster", "meteorology", "incident", " in science", "botanists", "scientists", "biologists", "geographers",
        "engineers", "physicians", "television series", "eclipse", "earthquake", "21st century", "20th century"]

const wikitextSkipMe = [" births]]", " deaths]]", " people]]", "[[Category:People", " scientists]]", " mathematician]]",
    "|Person who", "|Group of humans}}", " constellations]]", " doctors]]", " physicians]]"]

testMode()

describe("objectsFromWikiTest", () => {
    it("should fetch pages",
        async () => {
            const tasks = []
            const arr = []
            const result = []

            const name = "Category:Science_by_century"
            let last = name
            let lastP = "?"
            const waitTime = 800

            moralisSetup(false, Moralis)
            const WikiObject = Moralis.Object.extend("WikiObject")
            const query = new Moralis.Query(WikiObject)
            const results = await query.find()

            const alreadyProcessed = results.map(x => x.get('name'))
            // TODO: this is only the first 100 results! See downloadAllWikiImages.testEndpoint.js for pagination
            //debug("alreadyProcessed", alreadyProcessed.join("\n"))
            //return;

            function processPage(name, category) {
                lastP = name
                return getWikiTextForName(name).then(wikitext => {

                    if (wikitextSkipMe.find(x => wikitext.includes(x))) // was a non-Object
                        return

                    debug("res", name, wikitext)
                    result.push({name, wikitext})
                    return new Promise(p => {
                        setTimeout(() => {
                            p(getImageForName(name).then(img => {
                                    fs.writeFile('objects_gen.json',
                                        JSON.stringify({name, wikitext, img, category}) + ",\n",
                                        {flag: "a+"}, (err) => {
                                            if (err) throw err
                                            // console.log('The file is created if not existing!!');
                                        })
                                    return createItem(name, false, wikitext, img, category)
                                }
                            ))
                        }, waitTime)
                    })
                })
            }

            const r = xmur3(tempSeed())

            function processCat(name) {
                const catName = name
                last = name
                return fetch(getCatmembersUrl(name)).then(x => x.json()).then(res => {
                    const items = res?.query?.categorymembers
                    if (!items)
                        debug("error at ", name, res)

                    // Idea: shuffle for random coverage, on abort not everything is tried again that has been processed already
                    items.sort((a, b) => r() - r())

                    items.forEach(entry => {
                        const name = entry.title
                        const lower = name.toLowerCase()

                        const category = name.startsWith("Category:")

                        if (skipMe.find(x => lower.includes(x)) || skipYears.find(y => lower.includes(y)))
                            return

                        if (!arr.find(x => x.name === name)) {
                            if (category)
                                tasks.push(() => processCat(name))
                            else if (!alreadyProcessed.includes(name))
                                tasks.push(() => processPage(name, catName))
                        }
                    })
                })
            }

            await processCat(name)

            /*Array.from({length: 10}).forEach((_, i) =>
                tasks.push(() => new Promise(p => {
                    debug(i);
                    p()
                }))
            )*/

            while (tasks.length !== 0) {
                console.log("// " + new Date().toISOString(), tasks.length, last, lastP)
                await new Promise(p => setTimeout(p, waitTime))
                //console.log(new Date().toISOString())
                try {
                    await tasks.pop()()
                } catch (e) {
                    log("tasks pop err: ", e)
                }
            }

            debug(JSON.stringify(result, null, 2))
        })
})
