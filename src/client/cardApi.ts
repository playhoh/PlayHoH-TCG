import {Moralis} from "moralis"
import {Card} from "../../interfaces/cardTypes"
import {debug} from "../utils"
import {CardFeedbackData} from "../../interfaces/baseTypes"

export async function createCard(user: Moralis.User, setCard: (c: Moralis.Object) => void, onErr?: Function) {
    const Card = Moralis.Object.extend("Card")
    const card = new Card()
    card.set("name", "Albert Einstein#0")
    card.set("b", 1)
    card.set("creator", user)
    try {
        await card.save()
        setCard(card)
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        (onErr || alert)("Error: " + error.code + " " + error.message)
    }
}

export async function updateCard(card: Moralis.Object, setCard: Function, onErr?: Function) {
    try {
        await card.save()
        setCard(card)
    } catch (error) {
        (onErr || alert)("Error: " + error.code + " " + error.message)
    }
}

export async function queryCards(isPerson, setData: (arr: any[]) => void, searchText) {
    const query = new Moralis.Query(isPerson ? 'WikiPerson' : 'WikiObject') // .include('_User')

    query.contains('name', searchText)
    query.exists('data')
    query.exists('data.img')
    query.notEqualTo("data.img", "")

    const results = await query.find()
    const res = results.map((x: any) => {
        x.name = x.get('name')
        x.data = x.get('data')
        x.cardData = x.get('cardData')
        x.needsMinting = x.get('needsMinting')
        x.nftUrl = x.get('nftUrl')
        x.img = x.get('img')?.url()
        x.editor = x.get('editor')
        return x
    })
    setData(res)
}

export async function queryCardsToMint(setData: (arr: Card[]) => void) {
    const query = new Moralis.Query("Card")
    query.equalTo("needsMinting", true)

    let res = await query.find({useMasterKey: true})
    const items = res.map(x => {
            const res = {}
            const keys2 = ['key', 'name', 'displayName', 'typeLine', 'flavour', 'imgPos']
            keys2.forEach(k => res[k] = x.get(k))
            return res as Card
        }
    )

    setData(items)
}


export function voteFunction(user, thenDo?: Function) {
    return function (name: string, delta: number) {
        debug("vote", name, delta, "by user with session", user?.sessionToken)
        thenDo && thenDo(name)

        fetch("/api/vote", {
            method: "POST",
            body: JSON.stringify({name, delta, sessionToken: user?.sessionToken})
        }).then(x => x.json()).then(x => {
            debug("vote result", x)
        })
    }
}

export function feedbackFunction(user, thenDo?: Function) {
    return function (data: CardFeedbackData): void {
        debug("feedback", data.name, "on", data.field, "by user with session", user?.sessionToken)
        thenDo && thenDo(data.name)

        fetch("/api/feedback", {
            method: "POST",
            body: JSON.stringify({
                ...data, sessionToken: user?.sessionToken
            })
        }).then(x => x.json()).then(x => {
            debug("feedback result", x)
        })
    }
}
