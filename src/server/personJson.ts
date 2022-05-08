import fs from 'fs'
import path from 'path'
import {Card} from "@mui/material";

const getPath = file => path.resolve('./public', 'static', file);
const getFileContent = file => fs.readFileSync(getPath(file), 'utf-8');
//console.log("json: " + personContent?.length)
export const getFileJson = file => {
    const cont = getFileContent(file)
    let res = []
    try {
        res = cont ? JSON.parse(cont)?.filter(x => {
            // const res = (x.img ?? "") !== ""
            // console.log(x.name + " > " + res)
            return true // res //return true
        }) : []
    } catch (e) {
        console.log("getFileJson for " + file + " failed: " + e)
    }
    return res
}

//console.log("json 2: " + personJson?.length + ", " + JSON.stringify(personJson ? personJson[0] : undefined))

function parseCsvToCards(text) {
    return text.split('\n').map(x => {
        const arr = x.split('","').map(x => x.replace(/"/g, ""));
        // const image = arr[1]
        // console.log("row " + arr.join("|"))
        const done = arr[2]
        if (done === "")
            return null

        const obj =
            {
                name: arr[3],
                cost: arr[5],
                typeLine: arr[6],
                text: arr[7],
                wits: arr[8],
                phys: arr[9],
                // rarity: arr[10],
                flavor: arr[11],
                set: arr[12],
                logic: arr[13],
                info: arr[14],
            };
        Object.keys(obj).forEach(key => {
            if (key !== "flavor")
                try {
                    const p = parseFloat(obj[key])
                    if (p === 0 || p)
                        obj[key] = p
                } catch {
                }
        })
        return obj
    }).filter(x => x?.name)
}

export const personJson = getFileJson('person.json')
export const beta1Txt: string = getFileContent('beta1.txt')
export const beta1Json: any[] = parseCsvToCards(beta1Txt)

export const beta2Txt: string = getFileContent('beta2.txt')
export const beta2Json: any[] = parseCsvToCards(beta2Txt)

// console.log("beta1Json", JSON.stringify(beta1Json))
