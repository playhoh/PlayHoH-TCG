import Moralis from "moralis/node"
import {Card,} from "../../interfaces/cardTypes"
import {powerSymbol, resourceSymbol, victoryPointSymbol, witsSymbol} from "../cardData"
import {beta1Json, beta2Json} from "./personJson"

export function replaceCardText(card: Card): Card {
    // const typeLine = card?.typeLine || ""
    // const pluralTypes = typeLine.endsWith("s") ? typeLine + "es" : typeLine + "s"
    card.text = card?.text
        //?.replace(/\[PLURALTYPE\]/g, pluralTypes)
        ?.replace(/\[R\]/g, resourceSymbol) // "࿋")
        ?.replace(/\[P\]/g, powerSymbol) // "💪")
        ?.replace(/\[W\]/g, witsSymbol) // "👁")
        ?.replace(/\[_\]/g, victoryPointSymbol)
        ?.replace(/\\n/g, "\n")
    return card
}

export async function getCardForId(id0: string | number): Promise<Card> {
    const parts = id0.toString().split("?")
    const id = decodeURIComponent(parts[0])
    let res = await findSomeCard(x => x.equalTo('name', id).limit(1), undefined, undefined, id)
    return res[0]
}

export async function findSomeCard(queryFun: (x: Moralis.Query) => void, full?: boolean, keys?: string[],
                                   potentiallyName?: string): Promise<Card[]> {

    const predefined = [beta1Json, beta2Json]
    for (let i = 0; i < predefined.length; i++) {
        const orLookup = predefined[i].find(x => x.name === potentiallyName)
        if (orLookup) {
            return [{...replaceCardText(orLookup), legacy: true}]
        }
    }

    const query = new Moralis.Query("Card")
    if (queryFun)
        queryFun(query)

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

    arr.push(...items)
    return arr
}