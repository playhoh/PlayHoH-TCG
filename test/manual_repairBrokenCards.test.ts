import {base64OfHtml, debug, log} from "../src/utils"
import {testMode} from "../src/testUtils"
import Moralis from "moralis/node"
import {
    analyze,
    buildCardFromObj, generateCardTextFromName,
    generateValuesBasedOnCost,
    regenerateTextBasedOnMeasurement
} from "../src/server/dbpedia"
import {randomGen} from "../src/polygen"
import {isTooNew} from "../pages/api/trigger/[id]"
import {splitIntoBox} from "../src/measureText"
import {adjustNameAndTypeBasedOnMeasurement} from "../src/cardCreation"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

async function regenerateAllTextsAndStats(queryFunction) {
    const query = new Moralis.Query('Card')
    queryFunction && queryFunction(query)
    let n = 0
    let res: any[] = undefined
    while (res === undefined || res.length > 0) {
        res = await query.skip(n).find()
        await Promise.all(res.map(async (x: any) => {
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

// const describe = (a, b) => "INGORE, this is is a manual script"
describe("repair", () => {
    it("regenerate text and recalculate stats",
        async () => {
            // destructive! await regenerateAllTextsAndStats(x => x)
        }
    )

    it("repair Objects",
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
                    if (analyzed.comment) {
                        console.log("item", item, "analyzed.comment", analyzed.comment)
                        return x.save()
                    } else {
                        console.log("NO COMMENT FOUND for item", item, "analyzed.gen was", analyzed.gen)
                    }
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
                    await adjustNameAndTypeBasedOnMeasurement(x)
                    await regenerateTextBasedOnMeasurement(x)

                    if (x.dirty())
                        return x.save()
                }).filter(x => x))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards without images (broken image)",
        async () => {
            const query = new Moralis.Query('Card')
            query.contains('img', base64OfHtml)

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find({useMasterKey: true})
                await Promise.all(res.map(async (x: any) => {
                    try {
                        const item = x.get('name')
                        console.log("needed to delete ", item, ", had no image")
                        await x.destroy()
                    } catch (e) {
                        log("err", e)
                    }
                }))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards that are too new",
        async () => {
            const query = new Moralis.Query('Card')

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    const flavourRaw = x.get('flavour')
                    const flavour = flavourRaw?.replace("'''", "").replace("–", "-")

                    const {y, tooNew, yearAsNumber} = isTooNew(flavour)
                    if (tooNew) {
                        console.log("item too young: ", item, "y: ", y, "yearAsNumber:", yearAsNumber, "flavour", flavour)
                        return x.destroy()
                    } else {
                        if (flavourRaw !== flavour) {
                            x.set('flavour', flavour)
                            return x.save()
                        }
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

    /*it("delete cards with odd type or flavour",
        async () => {
            const query = new Moralis.Query('Card')
            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    const typeLine = x.get('typeLine')
                    const flavour = x.get('flavour')
                    if (flavour.length > 60 || typeLine.length > 60)
                        console.log("needed to delete ", item, ", had long type or flavour\nt ", typeLine.length, ", f ", flavour.length, "\n", typeLine, ",", flavour)
                    return x.destroy()
                }))
                n += 100
                console.log("n ", n)
            }
        })*/

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
