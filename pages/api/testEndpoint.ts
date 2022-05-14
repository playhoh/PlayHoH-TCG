// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {debug} from "../../src/utils"
import Moralis from "moralis/node"
import {moralisSetup} from "../../src/client/baseApi"

export default async function handler(req, res) {
    moralisSetup(false, Moralis)

    const name = "Monorail"
    const WikiPerson = Moralis.Object.extend("WikiPerson")
    const WikiObject = Moralis.Object.extend("WikiObject")

    function q(isPerson) {
        const classObj = isPerson ? WikiPerson : WikiObject
        const query = new Moralis.Query(classObj)
        query.exists("data")
        query.exists("data.img")
        query.notEqualTo("data.img", "")
        query.equalTo("name", name)
        return query
    }

    let x = await q(true).first()
    if (!x)
        x = await q(false).first()

    if (!x) {
        res.status(404).json({notFound: name})
    } else {
        const name2 = x.get('name')
        const data = x.get('data')
        const t = x.className
        debug("j", JSON.stringify(x))
        const imgBuffer = x.get('img')?.url()
        const result = {name: name2, data, imgBuffer, t, isPerson: t === "WikiPerson"}
        res.status(200).json(result)
    }
}
