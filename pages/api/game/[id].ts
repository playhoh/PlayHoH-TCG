import {debug, fromBase64, tempSeed, xmur3} from "../../../src/utils"
import {cleanCard} from "../../../src/server/cardLookup"
import {beta1Json, beta2Json} from "../../../src/server/personJson"
import {findSomeCard} from "../cards/all"

function deckFromJson(arr) {
    return [...arr]
        .filter(x => x.typeLine?.includes("Person") || x.typeLine?.includes("Object"))
        .map(x => cleanCard(x))
}

const betaDecks = {beta1: beta1Json, beta2: beta2Json}

function findArchetype(deckName) {
    let card = [...(betaDecks[deckName] || [])]
        .find(x => x.typeLine?.includes("Archetype"))

    if (card)
        cleanCard(card)

    let archetype = card ? {logic: card?.logic, text: card?.text} : undefined

    debug("deckName", deckName, " => archetype", archetype)

    return archetype
}

type GameInitParams = {
    user?: string,
    format?: {
        handSize?: number,
        deckSize?: number
    },
    seed?: string,
    enemy?: string
}

export async function getInitState(settings) {
    let gameInitParams = {} as GameInitParams
    try {
        const fromBase64Obj = fromBase64(settings)
        gameInitParams = JSON.parse(fromBase64Obj) as GameInitParams
        debug("game/param: ", gameInitParams)
    } catch (e) {
        debug("invalid param is ignored " + settings + ": " + e)
    }
    const {user, format, seed, enemy} = gameInitParams

    const r = xmur3(seed ?? tempSeed())

    const deckSize = format?.deckSize ?? 15
    const handSize = format?.handSize ?? 3
    const someCards = await findSomeCard(x => x, false,
        ["displayName", "name", "typeLine", "text", "power", "wits", "flavour", "key"]
    )

    //debug("randoms:", Array.from({length: 111}).map(x => r() - r()))

    someCards.sort(() => r() - r())
    let skip = 0
    const getCardArray = async (deck) => {
        const res = someCards.slice(skip, skip + deckSize)
        skip += deckSize
        /*let arr2 = betaDecks[deck] ? deckFromJson(betaDecks[deck]) : undefined

        arr2.sort((a, b) => r() - r())

        debug("deck ", deck, " yielded ", arr2.length, " items: ", arr2[0])

        const res = arr2.filter((x, i) => i < deckSize)
        return res*/
        return res
    }

    const enemyDeckName = "ignored", yourDeckName = "ignored"
    //const enemyDeckName = ((await getUserById(enemy)) || []) [0]?.deck
    const enemyDeck = await getCardArray(enemyDeckName)
    //const yourDeckName = ((await getUserById(user)) || [])[0]?.deck
    const yourDeck = await getCardArray(yourDeckName)
    debug("found decks for users: ", enemy, "=>", enemyDeckName, ", user=>", yourDeckName)

    //const yourObjective = {text: "End: You get ■ for each 🧠 of your people.", logic: "endCountWits"}
    const defaultObj = {text: "End: You get ■ for each ✊ of your people.", logic: "endCountPower"}
    const enemyObjective = findArchetype(enemyDeckName) || defaultObj
    const yourObjective = findArchetype(yourDeckName) || defaultObj

    const playerArr = [user, enemy]
    playerArr.sort()
    const [player1, player2] = playerArr

    const additionalCardEnemy = 1 // enemy begins
    const additionalCardYou = 0

    const init = {
        enemyHand: enemyDeck.slice(0, handSize + additionalCardEnemy).map(x => ({...x})),
        enemyDeck: enemyDeck.slice(handSize + additionalCardEnemy).map(x => ({...x})),
        enemyDiscard: [],
        enemyField: [],
        enemyResources: [],
        yourField: [],
        yourResources: [],
        yourHand: yourDeck.slice(0, handSize + additionalCardYou).map(x => ({...x})),
        yourDeck: yourDeck.slice(handSize + additionalCardYou).map(x => ({...x})),
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

export default async function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const obj = {init: await getInitState(id)}
    res.status(200).json(obj)
    // TODO: json, not string
    //res.status(200).end(JSON.stringify(obj, null, 2))
}
