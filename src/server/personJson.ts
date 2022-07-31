import {beta1Txt, beta2Txt} from "./staticData"
import {Card} from "../../interfaces/cardTypes"
import {parseNum} from "../utils"

function parseCsvToCards(text: string): Card[] {
    return text.split('\n')
        .splice(1) // csv header
        .map(x => {
            const arr = x.split('","').map(x => x.replace(/"/g, ""))
            // const image = arr[1]
            // console.log("row " + arr.join("|"))
            const done = arr[2]
            if (done === "")
                return null

            const obj: Card = {
                displayName: arr[3],
                name: arr[3],
                img: "",
                cost: parseNum(arr[5]),
                typeLine: arr[6],
                text: arr[7],
                wits: parseNum(arr[8]),
                power: parseNum(arr[9]),
                // rarity: arr[10],
                flavour: arr[11],
                // set: arr[12],
                key: arr[12],
                logic: arr[13], // for archetype
                comment: arr[14]
            }
            return obj
        }).filter(x => x?.name)
}

export const beta1Json: Card[] = parseCsvToCards(beta1Txt)
export const beta2Json: Card[] = parseCsvToCards(beta2Txt)