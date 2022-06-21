import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/client/baseApi"
import {debug} from "../../../src/utils"
import {buildCardFromWiki, recreateSetId} from "../../../src/cardCreation"
import {badWordList} from "../../../src/server/staticData"

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

async function forClass(table, counter) {
    await processAll(table, query => {
        query.doesNotExist("img")
        query.exists("data")
        query.exists("name")
    }, async (x, k) => {
        counter()
        let name = x.get('name')
        let s = recreateSetId(name, badWordList)
        debug("x::", x, "i:", k, "name", name, "id:", s)
        x.set('key', s)
        return x.save()
        // return wait(k)
    })
}

async function findForId(isPerson: boolean, id: string) {
    const classObj = isPerson ? "WikiPerson" : "WikiObject"
    const query = new Moralis.Query(classObj)
    query.equalTo("key", "#" + id)
    return await query.first()
}

/*
let counter = 0
    await forClass("WikiPerson", () => counter++)
    await forClass("WikiObject", () => counter++)
res.status(200).json({counter})
*/

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))


        let res1 = await findForId(true, id)
        if (!res1) {
            res1 = await findForId(false, id)
        }
        if (res1) {
            let cardData = res1.get('cardData')
            if (!cardData)
                cardData = buildCardFromWiki(res1.get("wikiData"))

            cardData.set = recreateSetId(res1.get('name'), badWordList)
            res.status(200).json(cardData)
        } else {
            res.status(404).json({notFound: id})
        }

}
