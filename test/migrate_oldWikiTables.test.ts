import Moralis from "moralis/node"
import {testMode} from "../src/testUtils"
import {trigger} from "../pages/api/trigger/[id]"

async function forTable(name) {
    const query = new Moralis.Query(name)

    query.exists('img')

    let n = 0
    let res: any[] = undefined
    while (res === undefined || res.length > 0) {
        res = await query.skip(n).find()
        await Promise.all(res.map(async (x: any) => {
            const item = x.get('name')
            const list = [item.replace(/ /g, "_")]
            await trigger(true, list, true)
        }))
        n += 100
        console.log("n ", n)
    }
}

testMode()
describe("migrate", () => {
    it("should work for objects", async () => {
        await forTable('WikiObject')
    })

    it("should work for people", async () => {
        await forTable('WikiPerson')
    })
})
