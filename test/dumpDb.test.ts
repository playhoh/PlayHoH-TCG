import {moralisSetup} from "../src/client/baseApi"
import Moralis from "moralis/node"
import {debug, testMode} from "../src/utils"

testMode()
jest.setTimeout(100_000_000)

function wait(k: number): Promise<void> {
    return new Promise(cont => setTimeout(() => {
        cont(null)
    }, 700 * k))
}

async function processAll(className: string,
                          q: (q: Moralis.Query) => void,
                          f: (a: any, i: number) => Promise<void>) {
    moralisSetup(true, Moralis)
    const query = new Moralis.Query(className)
    q(query)
    const n = 100

    async function iter(i) {
        const results = await query.skip(i).limit(n).find()
        if (results.length > 0) {
            await Promise.all(results.map((x, k) => {
                return f(x, k)
            }))

            await iter(i + n)

        } else {
            console.log("done! @" + i)
        }
    }

    await iter(0)
}

describe("DB", () => {
    it("should be read completely",
        async () => {
            await processAll("WikiPerson", query => {
                query.doesNotExist("img")
                query.exists("data")
                query.exists("name")
            }, (x, k) => {
                debug("x::", x, "i:", k)
                return wait(k)
            })
        })
})
