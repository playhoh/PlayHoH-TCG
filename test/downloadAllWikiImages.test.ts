import {moralisSetup} from "../src/baseApi"
import Moralis from "moralis/node"
import {testMode} from "../src/testUtils"
import {debug} from "../src/utils"
import {fetchWikiImageAndSaveAsFile} from "../src/cardCreation"

testMode()
jest.setTimeout(100_000_000)

function wait(k) {
    return new Promise(cont => setTimeout(() => {
        cont(null)
    }, 700 * k))
}

async function downloadAllMissingImages(isPerson) {
    moralisSetup(true, Moralis)
    const objectType = Moralis.Object.extend(isPerson ? "WikiPerson" : "WikiObject")
    const query = new Moralis.Query(objectType)
    query.doesNotExist("img")
    query.exists("data")
    query.exists("name")
    const n = 100

    async function iter(i) {
        const results = await query.skip(i).limit(n).find()
        const alreadyProcessed = results //.map(x => x.get('name'))
        if (alreadyProcessed.length > 0) {
            //console.log("alreadyProcessed @" + i, alreadyProcessed)
            await Promise.all(results.map((x, k) => { // TODO no slice .slice(0, 2)
                const name = x.get('name')
                const img = x.get('data')?.img
                //debug("item ", k, "called", name, img)
                if (img)
                    return fetchWikiImageAndSaveAsFile(img, name, x, {} as any).then(info => {
                        return x.save().then(() => {
                            debug("item", k, "called", name, "with file", info)
                            return wait(k)
                        }).catch(e => {
                            debug("ERR: item", k, "called", name, "with file", info, " bytes\n", e.toString()
                            )
                            return wait(k)
                        })
                    })
                else
                    return wait(k)
            }))

            await iter(i + n) //TODO comment in

        } else {
            console.log("done! @" + i)
        }
    }

    await iter(0)
}

describe("WikiImages", () => {
    it("should be downloading missing person images",
        async () => {
            await downloadAllMissingImages(true)
        })

    it("should be downloading missing object images",
        async () => {
            await downloadAllMissingImages(false)
        })
})
