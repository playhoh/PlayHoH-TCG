import {
    anglicize,
    capitalize,
    cardNameBoxWidthMinusCostSVG,
    cardNameFontSizeSVG,
    cardTextFontSizeSVG,
    cardTypeBoxWidthSVG,
    debug,
    xmur3
} from "./utils"
import {CardData, Effect, EffectsData} from "../interfaces/oldTypes"
import {WikiData} from "../interfaces/wikiTypes"
import {removeWikiLinks} from "./wikiApi"
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "./effectsApi"
import {splitIntoBox} from "./measureText"
import { Api } from "./Api"

const triggers = ["Enter: ", "Leave: ", "Main: "]
const triggersFactor = [2, 1, 4]

export const buildTextFor = (effectsData: EffectsData) => (displayType: string, intId: number): string => {
    const effects = buildEffectFor(effectsData)(displayType, intId)
    return effects.map(x => x.displayText).join("\n")
}

export const buildEffectFor = (effectsData: EffectsData) => (displayType: string, intId?: number, seed?: string): Effect[] => {
    if (!displayType)
        return []

    let currentTriggers = [...triggers]
    let relevantEffects = getRelevantEffectsFor(effectsData)(displayType)

    if (!relevantEffects?.length) {
        relevantEffects = getRelevantEffectsForObjectCategory(effectsData)(displayType)
    }

    if (seed && relevantEffects?.length > 0) {
        const r = xmur3(seed)
        relevantEffects.sort(() => r() - r())
        if (r() % 2 === 0)
            relevantEffects.slice(0, 1)
        else if (relevantEffects.length > 1)
            relevantEffects.slice(0, 2)
    }

    const effects = relevantEffects?.map((x, i) => {
        const index = i === 0 ? 0 : Math.abs(intId) % currentTriggers.length

        const trigger = currentTriggers[index]
        if (!trigger)
            return undefined

        // debug("rel eff: index", index, "tr", tr)
        const triggerPowerFactor = triggersFactor[index]
        currentTriggers.splice(index, 1)

        const displayText = trigger + capitalize(x.text) + "."
        return {...x, displayText, triggerPowerFactor, trigger}
    }).filter(x => x)
    // debug("effects for ", displayType, " are", effects)
    return effects

}

export function getIdNumberFromName(name: string, param?: any) {
    let idFromName = 0
    anglicize(name).toUpperCase()
        .split("")
        .forEach((c, i) => {
                //let number = c.charCodeAt(0)
                /*const char = c.charAt(0)
                if (char >= 'A' && char <= 'Z') {
                    number -= 'A'.charCodeAt(0)
                } else if (char >= '0' && char <= '9') {
                    number -= '0'.charCodeAt(0)
                } else {
                    number = 36
                }*/
                // return idFromName += number * (10 ** i) // A-Z, 0-9, " "

                idFromName += c.charCodeAt(0) * (param?.size || 36) ** Math.floor(i / (param?.div || 4))
            }
        )
    return idFromName
}

export function recreateSetId(name: string, badWords: string[]) {
    //let idFromName = getIdNumberFromName(name, size)
    //const set = getId(idFromName, badWords)
    //return set
    let potentiallyBad = hash(name)
    for (const key in badWords) {
        const word = badWords[key]
        if (potentiallyBad.includes(word)) {
            return "#0" + potentiallyBad.split("").reverse().join("").toUpperCase()
        }
    }
    return "#" + potentiallyBad
}

// https://stackoverflow.com/a/7616484/773842
export function hash(string: string): string {
    let hash = 0, i, chr
    if (!string)
        return "0"
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0 // Convert to 32bit integer
    }
    return (hash < 0 ? "0" : "") + Math.abs(hash).toString(36).toUpperCase()
}

export const buildCardFromWiki = (effectsData: EffectsData) => (wikiData: WikiData, badWords: string[]): CardData => {
    const seed = wikiData.name
    let seedNum = 0
    wikiData.name.split("").forEach(c => seedNum += c.charCodeAt(0))
    const r = xmur3(seed)

    let phys = r() % 3
    let wits = r() % 3
    let cost = 1 + (r() % 3)

    let text = ""
    let textPower = 0
    let foundType = ""
    let foundEffects = ""
    let witsAbilties = 0

    function processEffects(effects, part) {
        // debug("processEffects: ", part, "=>", effects)
        if (effects?.length > 0) {
            foundType = part
            text = effects.map(x => x.displayText).join("\n")
            foundEffects = effects.map(x => x.effect).join("+")

            effects.forEach(e => {
                textPower += e.triggerPowerFactor * e.power
                witsAbilties += e.witsAbility ? 1 : 0
            })
        }
    }

    wikiData.typeLine?.split(' ')?.forEach(part => {
        if (!text) {
            part = part.toLowerCase()
            const effects = buildEffectFor(effectsData)(part, seedNum, seed)
            processEffects(effects, part)
        }
    })

    if (!text) {
        const effects = buildEffectFor(effectsData)(wikiData.typeLine, seedNum, seed)
        processEffects(effects, wikiData.typeLine)
    }

    wikiData.longTypeLine?.split(' ')?.forEach(part => {
        if (!text) {
            part = part.toLowerCase()
            const effects = buildEffectFor(effectsData)(part, seedNum, seed)
            processEffects(effects, part)
        }
    })

    if (!text) {
        const effects = buildEffectFor(effectsData)(wikiData.longTypeLine, seedNum, seed)
        processEffects(effects, wikiData.longTypeLine)
    }

    if (!text) {
        const effects = buildEffectFor(effectsData)(wikiData.category, seedNum, seed)
        processEffects(effects, wikiData.category)
    }

    const cardPower = () => (textPower + phys + wits) / cost

    if (cardPower() < 3) {
        r() % 2 === 0 ? phys++ : wits++
    }

    if (witsAbilties > 0) {
        const temp = phys
        phys = Math.max(0, Math.min(phys, wits) - 1)
        wits = Math.max(1, Math.min(temp, wits))
    } else {
        const temp = wits
        wits = Math.max(0, Math.min(phys, wits) - 1)
        phys = Math.max(1, Math.min(phys, temp))
    }

    if (cardPower() > 8) {
        cost++
    }

    const set = recreateSetId(wikiData.name, badWords)

    const typeLine =
        (wikiData.isPerson ? "Person - " : "Object - ") + removeWikiLinks(wikiData.typeLine)?.replace(/[\[\]]/g, "")
    const effects = buildEffectFor(effectsData)(typeLine, seedNum, seed)
    processEffects(effects, typeLine)

    const result = {
        name: wikiData.name,
        typeLine,
        img: wikiData.img,
        text,
        cost,
        phys,
        wits,
        flavor: wikiData.year ?? "",
        set,
        genStats: {
            foundType,
            foundEffects,
            textPower,
            cardPower: cardPower()
        }
    } as CardData

    if (!wikiData.isPerson) {
        delete result.phys
        delete result.wits
    }
    return result
}

export function fetchWikiImageAndSaveAsFile(imgUrl: string, name: string, pointer: Api.Object,
                                            fixed: CardData, _Moralis?: any): Promise<any> {
    debug("fetching ", imgUrl, " for ", name, "...")
    return fetch(imgUrl)
        .then(x => x.arrayBuffer())
        .then(buf => {
            debug("got img " + imgUrl + ", has byte length " + buf.byteLength)

            const arr = Array.from(new Uint8Array(buf))
            const fileName = (
                    (name.length > 29 ? name.substring(0, 29) : name)
                ).replace(/[^A-Za-z0-9 \-]/g, "")
                + imgUrl.substring(imgUrl.lastIndexOf('.')).toLowerCase()

            let file = new Api.File(fileName, arr)
            return file.save({useMasterKey: true}).then(() => {
                pointer.set('img', file)
                fixed.wikiImg = fixed.img
                fixed.img = file.url()
            }).then(() =>
                new Promise(resolve => resolve("len:" + arr.length + ", fileName: " + fileName + ", url: " + fixed.img))
            )
        })
}

export async function adjustNameAndTypeBasedOnMeasurement(x: { get: (s: string) => any, set: (s: string, v: any) => void }) {
    const item = x.get('name')
    let displayName = x.get('displayName')
    const typeLine = x.get('typeLine')

    let arrName = splitIntoBox(displayName, cardNameFontSizeSVG, cardNameBoxWidthMinusCostSVG).map(x => x.text)
    if (arrName.length > 1) {
        console.log("needed to change display name (v1) for ", item, ", had too long name (>1): ",
            arrName.length, "lines:\n", arrName)
        displayName = displayName.split(" (")[0]
        x.set('displayName', displayName)
    }

    arrName = splitIntoBox(displayName, cardNameFontSizeSVG, cardNameBoxWidthMinusCostSVG).map(x => x.text)
    if (arrName.length > 1) {
        console.log("needed to change display name (v2) for ", item, ", had too long name (>1): ",
            arrName.length, "lines:\n", arrName)
        const newDisplayName = displayName.split(", ")[0]
        x.set('displayName', newDisplayName)
    }

    const arrType = splitIntoBox(typeLine, cardTextFontSizeSVG, cardTypeBoxWidthSVG).map(x => x.text)
    if (arrType.length > 1) {
        console.log("needed to change type for ", item, ": ", typeLine, ", had too long type (>1): ",
            arrType.length, "lines:\n", arrType)
        const newTypeLine = typeLine.split(", ")[0]
        x.set('typeLine', capitalize(newTypeLine))
    }
}
