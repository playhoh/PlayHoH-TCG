import {capitalize, xmur3} from "./utils"
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "./effectsApi"
import {CardData, Effect, EffectsData} from "../interfaces/cardTypes"
import {WikiData} from "../interfaces/wikiTypes"

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

export function recreateSetId(name: string, badWords: string[]) {
    let idFromName = 0
    name.split("").forEach((c, i) => idFromName += c.charCodeAt(0) * ((i + 1) * 10))
    const set = getId(idFromName, badWords)
    return set
}

export const buildCardFromWiki = (effectsData: EffectsData) => (wikiData: WikiData, badWords: string[]): CardData => {
    const seed = wikiData.name
    let seedNum = 0
    wikiData.name.split("").forEach(c => seedNum += c.charCodeAt(0))
    const r = xmur3(seed)

    // debug("seed", seed, "seedNum", seedNum) // , "r", r(), r(), r())

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

    const result = {
        name: wikiData.name,
        typeLine: (wikiData.isPerson ? "Person - " : "Object - ") + wikiData.typeLine,
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

export function getId(id: number, badWords: string[]): string {
    if (id >= 0) {
        const potentiallyBad = id.toString(36)
        let result = potentiallyBad
        for (const key in badWords) {
            const word = badWords[key]
            if (potentiallyBad.includes(word)) {
                return "#0" + result.split("").reverse().join("").toUpperCase()
            }
        }
        return "#" + result.toUpperCase()
    }
    return "(id not available for " + id + ")"
}
