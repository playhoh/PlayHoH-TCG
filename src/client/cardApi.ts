import {Moralis} from "moralis"
import fetch from "isomorphic-fetch"
import {CardData} from "../../interfaces/cardTypes"
import {debug} from "../utils"

export async function createCard(user: Moralis.User, setCard: (c: Moralis.Object) => void, onErr?: Function) {
    const Card = Moralis.Object.extend("Card")
    const card = new Card();
    card.set("name", "Albert Einstein#0");
    card.set("b", 1);
    card.set("creator", user)
    try {
        await card.save();
        setCard(card)
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        (onErr || alert)("Error: " + error.code + " " + error.message);
    }
}

export async function updateCard(card: Moralis.Object, setCard: Function, onErr?: Function) {
    try {
        await card.save();
        setCard(card)
    } catch (error) {
        (onErr || alert)("Error: " + error.code + " " + error.message);
    }
}

export function updateWikiCard(pointer: Moralis.Object, user: Moralis.User, name: string,
                               fixedCard: CardData): Promise<string> {
    const fixed = {...fixedCard}
    let img = fixed.img?.replace(/120px/g, "500px")

    const fetchImgFirst =
        !img.includes("moralis")
            ? fetch(img).then(x => x.arrayBuffer())
                .then(buf => {
                    debug("img" + img + ":" + buf.byteLength)

                    const arr = Array.from(new Uint8Array(buf))
                    const fileName = (
                            (name.length > 29 ? name.substring(0, 29) : name)
                        ).replace(/[^A-Za-z0-9 \-]/g, "")
                        + img.substring(img.lastIndexOf('.')).toLowerCase()

                    let file = new Moralis.File(fileName, arr)
                    return file.save({useMasterKey: true}).then(() => {
                        pointer.set('img', file)
                        fixed.wikiImg = fixed.img
                        fixed.img = file.url()
                    })
                })
            : Promise.resolve()

    return fetchImgFirst.then(() => {
        fixed.text = fixed.text.replace(/\\n/g, "\n")
        pointer.set('cardData', fixed)
        pointer.set('editor', user)
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
        x.img = x.get('img')?.url()
        x.editor = x.get('editor')
        return x
    })
    setData(res)
}
