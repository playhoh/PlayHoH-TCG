import {beta1Txt, beta2Txt, getFileContent} from "./staticData"
import {CardData} from "../../interfaces/cardTypes"
import { parseNum } from "../utils"

function parseCsvToCards(text: string): CardData[] {
    return text.split('\n')
        .splice(1) // csv header
        .map(x => {
            const arr = x.split('","').map(x => x.replace(/"/g, ""))
            // const image = arr[1]
            // console.log("row " + arr.join("|"))
            const done = arr[2]
            if (done === "")
                return null

            const obj: CardData = {
                name: arr[3],
                cost: parseNum(arr[5]),
                typeLine: arr[6],
                text: arr[7],
                wits: parseNum(arr[8]),
                phys: parseNum(arr[9]),
                // rarity: arr[10],
                flavor: arr[11],
                set: arr[12],
                logic: arr[13], // for archetype
                info: arr[14],
            }
            return obj
        }).filter(x => x?.name)
}

export const beta1Json: CardData[] = parseCsvToCards(beta1Txt)
export const beta2Json: CardData[] = parseCsvToCards(beta2Txt)