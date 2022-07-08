import {Moralis} from "moralis"
import {CardData} from "../../interfaces/cardTypes"
import {fetchWikiImageAndSaveAsFile, recreateSetId} from "../cardCreation"
import {debug} from "../utils"

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

export function deleteWikiCard(pointer: Moralis.Object, name: string) {
    return pointer.destroy().then(x => "deleted " + name)
}

export function updateWikiCard(pointer: Moralis.Object, user: Moralis.User, name: string,
                               fixedCard: CardData): Promise<string> {
    const fixed = {...fixedCard}
    let img = fixed.img?.replace(/120px/g, "500px")

    const fetchImgFirst =
        !img.includes("moralis")
            ? fetchWikiImageAndSaveAsFile(img, name, pointer, fixed)
            : Promise.resolve()

    return fetchImgFirst.then(() => {
        fixed.text = fixed.text.replace(/\\n/g, "\n")
        pointer.set('cardData', fixed)
        pointer.set('editor', user)
        pointer.set('needsMinting', true)
        return pointer.save().then(() => "Saved " + name + " in db.")
    })
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

export function queryCardsToMint(isPerson, setData: (arr: any[]) => void, badWords) {
    const query = new Moralis.Query(isPerson ? 'WikiPerson' : 'WikiObject') // .include('_User')

    query.exists("cardData")
    query.equalTo("needsMinting", true)

    query.find().then(results => {
        const res = results.map((x: any) => {
            x.name = x.get('name')
            x.data = x.get('data')
            x.cardData = x.get('cardData')
            x.needsMinting = x.get('needsMinting')
            x.nftUrl = x.get('nftUrl')
            x.img = x.get('img')?.url()
            x.editor = x.get('editor')
            x.key = recreateSetId(x.name, badWords)
            return x
        })
        setData(res)
    })
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