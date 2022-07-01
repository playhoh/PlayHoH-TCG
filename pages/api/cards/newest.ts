import {moralisSetup} from "../../../src/client/baseApi"
import {debug} from "../../../src/utils"
import Moralis from "moralis/node"

export default async function handler(req, res) {
    moralisSetup(true, Moralis)
    debug("called newest/cards")

    function findSome(isPerson, cont, onErr) {
        const WikiPerson = Moralis.Object.extend("WikiPerson")
        const WikiObject = Moralis.Object.extend("WikiObject")
        const classObj = isPerson ? WikiPerson : WikiObject
        const query = new Moralis.Query(classObj)
        query.exists("cardData")
        //query.contains("data.category", text)
        query.find({useMasterKey: true})
            .then(res =>
                cont(res.map(x => {
                    const data = x.get('cardData')
                    const id = x.get('name')
                    const key = x.get('key')
                    const name = data.displayName
                    delete data.displayName
                    delete data.wikiImg
                    return {id, name, key, ...data}
                }))).catch(onErr)
    }

    function onErr(x) {
        res.status(400).json({error: x.toString()})
    }

    findSome(true, people => {
        findSome(false, objects => {
            const cards = [...people, ...objects]
            res.status(200).json(cards)
        }, onErr)
    }, onErr)
}
