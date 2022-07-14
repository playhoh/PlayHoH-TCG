import Moralis from "moralis/node"
import {shuffle} from "../utils"

export type CardEntry = {
    name: string, type: string, cost: number
}

export function generateBoosterTakingFromArray(cardsAvailable: CardEntry[], size: number) {
    const res = []
    let costs = {}
    let types = {}
    const maxCosts = {
        "4": Math.round(size / 14),
        "3": Math.round(size / 3.75),
        "2": Math.round(size / 3),
        "1": Math.round(size / 3.75)
    }
    const objCount = Math.round(size / 2.5)
    const maxTypes = {
        "Object": objCount,
        "Person": size - objCount
    }

    function ok(c: CardEntry, costs, types) {
        return (costs[c.cost + ""] ?? 0) < maxCosts[c.cost + ""] && (types[c.type] ?? 0) < maxTypes[c.type]
    }

    let i = 1
    while (cardsAvailable.length > 0 && res.length < size) {
        const card = cardsAvailable.pop()

        let check = ok(card, costs, types)

        console.log("i", i++, "card ", card, " ok? ", check, "res.length", res.length)
        if (check) {
            costs[card.cost + ""] = (costs[card.cost + ""] ?? 0) + 1
            types[card.type] = (types[card.type] ?? 0) + 1
            res.push(card)
        }
    }
    shuffle(res)
    res.forEach(x => {
        delete x.type
    })
    return res
}

export async function getAvailableCardsFull(skip?: number, limit?: number) {
    const additionalAttributes = ["img"]
    return getAvailableCards(skip, limit, additionalAttributes)
}

export async function getAvailableCards(skip?: number, limit?: number, additionalAttributes?: string[]) {
    const query = new Moralis.Query(Moralis.Object.extend("Card"))
    let group = {
        objectId: "$name",
        cost: {
            $last: "$cost"
        },
        typeLine: {
            $last: "$typeLine"
        },
        displayName: {
            $last: "$displayName"
        },
        wits: {
            $last: "$wits"
        },
        power: {
            $last: "$power"
        },
        key: {
            $last: "$key"
        },
        text: {
            $last: "$text"
        },
        flavour: {
            $last: "$flavour"
        },
    }

    additionalAttributes && additionalAttributes.forEach(key => group[key] = {$last: "$" + key})

    let pipeline: any[] = [{group}]
    if (skip !== undefined) {
        pipeline = [...pipeline, {skip: skip}]
        // query.skip(skip)
    }
    if (limit !== undefined) {
        pipeline = [...pipeline, {limit: limit}]
        // query.limit(limit)
    }
    const items = await query.aggregate(pipeline)
    const cardsAvailable = items.map(x => {
        x.name = x.objectId
        delete x.objectId
        x.type = x.typeLine.split(" - ")[0]
        return x
    }) as CardEntry[]
    return cardsAvailable
}
