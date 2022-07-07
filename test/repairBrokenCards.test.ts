import {cardBoxWidth, debug} from "../src/utils"
import {testMode} from "../src/testUtils"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj} from "../src/dbpedia"
import {splitIntoBox} from "../pages/api/measureText"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

describe("repair", () => {
    it("trim type for cards with long type",
        async () => {
            const query = new Moralis.Query('Card')
            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    const typeLine = x.get('typeLine')

//                    const analyzed = await analyze(item.replace(/ /g, '_'))
                    //                  if (!analyzed?.img) {
                    const arr = splitIntoBox(typeLine, 12, cardBoxWidth)

                    console.log("needed to change type for ", item, ": ", typeLine, ", had too long type: ", arr.length, "lines:\n", arr)
                    //                }
                }))
                n += 100
                console.log("n ", n)
            }
        })

    it("delete cards without images",
        async () => {
            const query = new Moralis.Query('Card')

            // query.startsWith('img', "data:image/png;base64,PCFET0NUWVBFIGh0bWw+")
            query.startsWith('img', "data:image/svg;base64,PCFET0NUWVBFIGh0bWw+")
            // query.startsWith('img', "data:image/jpeg;base64,PCFET0NUW")

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')

                    const analyzed = await analyze(item.replace(/ /g, '_'))
                    if (!analyzed?.img) {
                        console.log("needed to delete ", item, ", had no image")
                        await x.destroy()
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
            const query = new Moralis.Query('Card')

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')
                    //  const typeLine = x.get('typeLine')
                    const flavour = x.get('flavour')
                    const y = flavour.split("/")[0]
                    const tooNew = parseInt(y) && parseInt(y) >= 1900
                    if (tooNew) {
                        console.log("item too young: ", item, "y: ", y)
                        await x.destroy()
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

    it("repair card text",
        async () => {
            const query = new Moralis.Query('Card')

            query.equalTo("text", "Enter: Pay [R] to destroy an object.")

            let n = 0
            let res: any[] = undefined
            while (res === undefined || res.length > 0) {
                res = await query.skip(n).find()
                await Promise.all(res.map(async (x: any) => {
                    const item = x.get('name')

                    const analyzed = await analyze(item.replace(/ /g, '_'))
                    console.log("item", item, "analyzed", analyzed)

                    const {text} = await buildCardFromObj(analyzed, true)
                    console.log("item ", item, "new text ", text)
                    x.set('text', text)
                    await x.save()
                }))
                n += 100
                console.log("n ", n)
            }
        })
})
