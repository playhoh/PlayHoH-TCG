import {Card,} from "../../interfaces/cardTypes"
import {beta1Json, beta2Json} from "./personJson"
import {Api} from "../Api"
import {replaceSymbols} from "../utils"
import {ApiServer} from "./ApiServer"

export function replaceCardText(card: Card): Card {
    // const typeLine = card?.typeLine || ""
    // const pluralTypes = typeLine.endsWith("s") ? typeLine + "es" : typeLine + "s"
    card.text = replaceSymbols(card?.text)
    //?.replace(/\[PLURALTYPE\]/g, pluralTypes)
    return card
}

export async function getCardForId(id0: string | number): Promise<Card> {
    const parts = id0.toString().split("?")
    const id = decodeURIComponent(parts[0])
    let res = await findSomeCard(x => x.equalTo('name', id).limit(1), undefined, undefined, id)
    return res[0]
}

export async function findSomeCard(queryFun: (x: any) => void, full?: boolean, keys?: string[],
                                   potentiallyName?: string): Promise<Card[]> {

    const predefined = [beta1Json, beta2Json]
    for (let i = 0; i < predefined.length; i++) {
        const orLookup = predefined[i].find(x => x.name === potentiallyName)
        if (orLookup) {
            return [{...replaceCardText(orLookup), legacy: true}]
        }
    }

    const query = new Api.Query("Card")
    if (queryFun)
        queryFun(query)

    ApiServer.init()
    const arr = []
    let res = await query.find({useMasterKey: true})
    const items = full
        ? res.map(x => JSON.parse(JSON.stringify(x)))
        : res.map(x => {
                const res = {}
                const keys2 = keys || ['key', 'name', 'displayName', 'typeLine', 'flavour', 'imgPos']
                keys2.forEach(k => res[k] = x.get(k))
                return res
            }
        )
    items.forEach(x => {
        if (x.typeLine?.startsWith("Person")) {
            x.power = x.power || "0"
            x.wits = x.wits || "0"
        }
    })
    arr.push(...items)
    return arr
}