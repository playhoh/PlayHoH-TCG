import {debug, fromBase64, parseUrlParams, shuffle} from "../../../src/utils"
import {generateBoosterTakingFromArray, getAvailableCards} from "../../../src/server/boosterGeneration"
import {moralisSetup} from "../../../src/baseApi"
import {NextApiRequest, NextApiResponse} from "next"

type GameInitParams = {
    user?: string,
    format?: {
        handSize?: number,
        deckSize?: number
    },
    seed?: string,
    enemy?: string
}

const defaultObj = {text: "End: You get [_] for each [P] of your people.", logic: "endCountPower"}

export async function getInitState(settings, _debug?: boolean) {
    let gameInitParams = {} as GameInitParams
    try {
        const fromBase64Obj = fromBase64(settings.replace(/_/g, "/"))
        gameInitParams = JSON.parse(fromBase64Obj) as GameInitParams
        debug("game/param: ", gameInitParams)
    } catch (e) {
        debug("invalid param is ignored " + settings + ": " + e)
    }
    const {user, seed, format, enemy} = gameInitParams

    const size = format?.deckSize ?? 14
    const handSize = format?.handSize ?? 3
    const additionalCol = undefined // ["comment", "displayName",] // TODO v2
    const cardsAvailable = await getAvailableCards(undefined, 256, additionalCol,
        undefined, _debug)
    shuffle(cardsAvailable, seed)

    const booster1 = generateBoosterTakingFromArray(cardsAvailable, size)
    const booster2 = generateBoosterTakingFromArray(cardsAvailable, size)

    debug("booster1/2", {booster1, booster2})

    const enemyObjective = defaultObj
    const yourObjective = defaultObj

    const playerArr = [user, enemy]
    playerArr.sort()
    const [player1, player2] = playerArr

    const additionalCardEnemy = 1 // enemy begins
    const additionalCardYou = 0

    const init = {
        enemyHand: booster1.slice(0, handSize + additionalCardEnemy).map(x => ({...x})),
        enemyDeck: booster1.slice(handSize + additionalCardEnemy).map(x => ({...x})),
        enemyDiscard: [],
        enemyField: [],
        enemyResources: [],
        yourField: [],
        yourResources: [],
        yourHand: booster2.slice(0, handSize + additionalCardYou).map(x => ({...x})),
        yourDeck: booster2.slice(handSize + additionalCardYou).map(x => ({...x})),
        yourDiscard: [],
        yourObjective,
        enemyObjective,
        player1,
        player2
    }

    let id = 0
    Object.keys(init).map(key => {
        // id += 30
        const arr = init[key]
        if (arr && arr.forEach)
            arr.forEach(x => x.id = id++)
    })
    return init
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let id = req.url.substring(req.url.lastIndexOf("/") + 1)

    const search = decodeURIComponent(req.url.substring(req.url.lastIndexOf("?") + 1))
    if (search) {
        id = id.replace("?" + search, "")
    }
    const params = parseUrlParams("?" + search)

    moralisSetup(true)
    const obj = {init: await getInitState(id, params.debug)}
    res.status(200).json(obj)
}

// function deckFromJson(arr) {
//     return [...arr]
//         .filter(x => x.typeLine?.includes("Person") || x.typeLine?.includes("Object"))
//         .map(x => cleanCard(x))
// }
//
// const betaDecks = {beta1: beta1Json, beta2: beta2Json}
//
// function findArchetype(deckName) {
//     let card = [...(betaDecks[deckName] || [])]
//         .find(x => x.typeLine?.includes("Archetype"))
//
//     if (card)
//         cleanCard(card)
//
//     let archetype = card ? {logic: card?.logic, text: card?.text} : undefined
//
//     debug("deckName", deckName, " => archetype", archetype)
//
//     return archetype
// }
//
// export async function getInitStateOldForConstructed(settings) {
//     let gameInitParams = {} as GameInitParams
//     try {
//         const fromBase64Obj = fromBase64(settings)
//         gameInitParams = JSON.parse(fromBase64Obj) as GameInitParams
//         debug("game/param: ", gameInitParams)
//     } catch (e) {
//         debug("invalid param is ignored " + settings + ": " + e)
//     }
//     const {user, format, seed, enemy} = gameInitParams
//
//     const r = xmur3(seed ?? tempSeed())
//
//     const deckSize = format?.deckSize ?? 15
//     const handSize = format?.handSize ?? 3
//     const someCards = await findSomeCard(x => x, false,
//         ["displayName", "name", "typeLine", "text", "power", "wits", "flavour", "key"]
//     )
//
//     //debug("randoms:", Array.from({length: 111}).map(x => r() - r()))
//
//     shuffle(someCards)
//     const getCardArray = async (deck) => {
//         let arr2 = betaDecks[deck] ? deckFromJson(betaDecks[deck]) : undefined
//
//         arr2.sort((a, b) => r() - r())
//
//         debug("deck ", deck, " yielded ", arr2.length, " items: ", arr2[0])
//
//         const res = arr2.filter((x, i) => i < deckSize)
//         return res
//     }
//
//     const enemyDeckName = "ignored", yourDeckName = "ignored"
//     //const enemyDeckName = ((await getUserById(enemy)) || []) [0]?.deck
//     const enemyDeck = await getCardArray(enemyDeckName)
//     //const yourDeckName = ((await getUserById(user)) || [])[0]?.deck
//     const yourDeck = await getCardArray(yourDeckName)
//     debug("found decks for users: ", enemy, "=>", enemyDeckName, ", user=>", yourDeckName)
//
//     //const yourObjective = {text: "End: You get ■ for each 🧠 of your people.", logic: "endCountWits"}
//     const enemyObjective = findArchetype(enemyDeckName) || defaultObj
//     const yourObjective = findArchetype(yourDeckName) || defaultObj
//
//     const playerArr = [user, enemy]
//     playerArr.sort()
//     const [player1, player2] = playerArr
//
//     const additionalCardEnemy = 1 // enemy begins
//     const additionalCardYou = 0
//
//     const init = {
//         enemyHand: enemyDeck.slice(0, handSize + additionalCardEnemy).map(x => ({...x})),
//         enemyDeck: enemyDeck.slice(handSize + additionalCardEnemy).map(x => ({...x})),
//         enemyDiscard: [],
//         enemyField: [],
//         enemyResources: [],
//         yourField: [],
//         yourResources: [],
//         yourHand: yourDeck.slice(0, handSize + additionalCardYou).map(x => ({...x})),
//         yourDeck: yourDeck.slice(handSize + additionalCardYou).map(x => ({...x})),
//         yourDiscard: [],
//         yourObjective,
//         enemyObjective,
//         player1,
//         player2
//     }
//
//     let id = 0
//     Object.keys(init).map(key => {
//         // id += 30
//         const arr = init[key]
//         if (arr && arr.forEach)
//             arr.forEach(x => x.id = id++)
//     })
//     return init
// }