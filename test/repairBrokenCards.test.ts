import {capitalize, cardBoxNameFontSize, cardBoxWidthMinusCost, debug, log} from "../src/utils"
import {testMode} from "../src/testUtils"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj, generateValuesBasedOnCost} from "../src/server/dbpedia"
import {splitIntoBox} from "../pages/api/measureText"
import {randomGen} from "../src/polygen"
import {isTooNew} from "../pages/api/trigger/[id]"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

async function generateCardTextFromName(item) {
    const analyzed = await analyze(item.replace(/ /g, '_'))
    console.log("item", item, "analyzed", analyzed)

    const {text} = await buildCardFromObj(analyzed, true)
    console.log("item ", item, "new text ", text)
    return text
}

async function regenerate() {
    const query = new Moralis.Query('Card')
    //query.startsWith('typeLine', isPerson ? "Person - " : "Object - ")
    let n = 0
    let res: any[] = undefined
    while (res === undefined || res.length > 0) {
        res = await query.skip(n).find()
        await Promise.all(res.map(async (x: any) => {
                // const text = x.get('text')
                const name = x.get('name')
                const r = randomGen(name)
                const cost = 1 + (r() % 4)

                const text = await generateCardTextFromName(name)
                x.set('text', text)
                if (x.get('typeLine')?.includes("Person - ")) {
                    const upkeep = text.includes("Main: Pay [R] or end this")
                    const {wits, power} = generateValuesBasedOnCost(cost, upkeep, r)
                    x.set('wits', wits)
                    x.set('power', power)

                    x.set('cost', cost)
                    console.log("changed ", name + ": 👁 " + wits + ", ✊ " + power + " for △ "
                        + cost + (upkeep ? "+upkeep" : "") + " and text: " + text)
                } else {
                    console.log("changed ", name + " (Object) text: " + text)
                }

                return x.save()
            }
        ))
        n += 100
        console.log("n ", n)
    }
}

describe("repair", () => {

    it("regenerate text and recalculate stats",
        async () => {
            await regenerate()
        }
    )

    it("regenerate Objects",
        async () => {
            const query = new Moralis.Query('Card')
            query.startsWith('typeLine', "Object - ")
            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const name = x.get('name')
                    console.log("name: ", name)
                    x.set('wits', undefined)
                    x.set('power', undefined)
                    return x.save()
                }))
                n += 100
                console.log("n ", n)
            }
        }
    )

    it("fetch comments and store them",
        async () => {
            const query = new Moralis.Query('Card')
            query.doesNotExist('comment')
            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    const analyzed = await analyze(item.replace(/ /g, '_'))
                    x.set('comment', analyzed.comment)
                    console.log("item", item, " analyzed.comment", analyzed.comment)
                    if (analyzed.comment)
                        return x.save()
                }))
                n += 100
                console.log("n ", n)
            }
        }
    )

    it("trim texts for cards with long strings",
        async () => {
            const query = new Moralis.Query('Card')
            let n = 0
            let res: Moralis.Object[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async x => {
                    const item = x.get('name')
                    let displayName = x.get('displayName')
                    const typeLine = x.get('typeLine')
                    const text = x.get('text')

                    // const analyzed = await analyze(item.replace(/ /g, '_'))
                    //                  if (!analyzed?.img) {

                    let arrName = splitIntoBox(displayName, cardBoxNameFontSize, cardBoxWidthMinusCost).map(x => x.text)
                    if (arrName.length > 1) {
                        console.log("needed to change display name for ", item, ", had too long name (>1): ",
                            arrName.length, "lines:\n", arrName)
                        displayName = displayName.split(", ")[0]
                        x.set('displayName', displayName)
                    }
                    arrName = splitIntoBox(displayName, cardBoxNameFontSize, cardBoxWidthMinusCost).map(x => x.text)
                    if (arrName.length > 1) {
                        console.log("needed to change display name (v2) for ", item, ", had too long name (>1): ",
                            arrName.length, "lines:\n", arrName)
                        displayName = displayName.split(" (")[0]
                        x.set('displayName', displayName)
                    }

                    const arrType = splitIntoBox(typeLine).map(x => x.text)
                    if (arrType.length > 1) {
                        console.log("needed to change type for ", item, ": ", typeLine, ", had too long type (>1): ",
                            arrType.length, "lines:\n", arrType)
                        const typeLine2 = typeLine.split(", ")[0]
                        x.set('typeLine', capitalize(typeLine2))
                    }

                    const arrText = splitIntoBox(text).map(x => x.text)
                    if (arrText.length > 4) {
                        console.log("needed to change text for ", item, ": ", text, ", had too long text (>4): ",
                            arrText.length, "lines:\n", arrText)

                        const newText = await generateCardTextFromName(item)
                        x.set('text', newText)
                    }
                    if (x.dirty())
                        return x.save()
                    //                }
                }).filter(x => x))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards without images (broken image)",
        async () => {
            const query = new Moralis.Query('Card')
            query.contains('img', ";base64,PCFET0NUW")
            // this ist base64 of html

            let n = 0
            let res: any[] = undefined
            //console.log("res", res)
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find({useMasterKey: true})
                // console.log("q", res.length, res)
                await Promise.all(res.map(async (x: any) => {
                    try {
                        const item = x.get('name')
                        //if (item === "Wolfgang Amadeus Mozart")
                        //    return Promise.resolve() // i need him for testing ^^

                        //const analyzed = await analyze(item.replace(/ /g, '_'))
                        //if (!analyzed?.img) {
                        console.log("needed to delete ", item, ", had no image")
                        await x.destroy()
                        //}

                    } catch (e) {
                        log("err", e)
                    }
                }))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards with wrong type?",
        async () => {
            const query = new Moralis.Query('Card')

            query.contains('typeLine', "List of ")

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    const typeLine = x.get('typeLine')

                    const analyzed = await analyze(item.replace(/ /g, '_'))
                    //if (!analyzed?.img) {
                    console.log("needed to change typeLine of ", item, ":", typeLine, ", alternatives: ", analyzed.gen)
                    //await x.destroy()
                    //}
                }))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards that are too new",
        async () => {
            //const a = isTooNew("January or February 1548")
            //console.log("a", a)
            //return

            const query = new Moralis.Query('Card')

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    const flavour = x.get('flavour')?.replace("'''", "").replace("–", "-")

                    const {y, tooNew, yearAsNumber} = isTooNew(flavour)
                    if (tooNew) {
                        console.log("item too young: ", item, "y: ", yearAsNumber, "flavour", flavour)
                        return x.destroy()
                    } else {
                        // console.log("item ok: ", item, "y: ", yearAsNumber, "flavour", flavour)
                    }
                }))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards without type",
        async () => {
            const query = new Moralis.Query('Card')
            query.endsWith('typeLine', "undefined")
            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    console.log("needed to delete ", item, ", had no image")
                    await x.destroy()
                }))
                n += 100
                console.log("n ", n)
            }
        })

    /*    it("repair card text",
            async () => {
                const query = new Moralis.Query('Card')

                query.equalTo("text", "Enter: Pay [R] to destroy an object.")

                let n = 0
                let res: any[] = undefined
                while (res === undefined || res.length > 0) {
                    res = await query.skip(n).find()
                    await Promise.all(res.map(async (x: any) => {
                        const item = x.get('name')

                        const text = await generateCardTextFromName(item)
                        x.set('text', text)
                        await x.save()
                    }))
                    n += 100
                    console.log("n ", n)
                }
            })
    */
})
