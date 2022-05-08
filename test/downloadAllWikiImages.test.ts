import {moralisSetup} from "../src/client/baseApi"
import Moralis from "moralis/node"
import {debug, testMode} from "../src/utils";

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
                    return fetch(img).then(x => x.arrayBuffer()).then(buf => {
                        const arr = Array.from(new Uint8Array(buf)) // Uint8Array.from()
                        //debug("arr", arr)
                        const fileName = (
                                (name.length > 29 ? name.substring(0, 29) : name)
                            ).replace(/[^A-Za-z0-9 \-]/g, "")
                            + img.substring(img.lastIndexOf('.')).toLowerCase()
                        /*anglicize(
                            decodeURIComponent(img.substring(img.lastIndexOf('/') + 1))
                        ).replace(/%/g, "")*/ // odd special chars in filenames
                        let file = new Moralis.File(fileName, arr)
                        //debug("f:", file)
                        debug("saving file", fileName, " from url", img, "...")
                        return file.save({useMasterKey: true}).then(() => {
                            x.set('img', file)
                            return x.save().then(() => {
                                debug("item", k, "called", name, "with file", fileName, "\nurl",
                                    img, "FETCHED", arr.length, " bytes"
                                )
                                return wait(k)
                            }).catch(e => {
                                debug("ERR: item", k, "called", name, "with file", fileName, "\nurl",
                                    img, "FETCHED", arr.length, " bytes\n", e.toString()
                                )
                                return wait(k)
                            })
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
