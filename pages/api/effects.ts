import {Effect, EffectCategory, EffectLogic} from "../../interfaces/oldTypes"
import {categoriesTxt, effectsTxt} from '../../src/server/staticData'
import {Moralis} from "moralis"
import {fetchWikiImageAndSaveAsFile} from "../../src/cardCreation"

export const parsedEffects = effectsTxt
    .replace(/\r/g, "")
    .split('\n')
    .map(x => {
        const parts =
            x.split("\",\"").map(x => x.replace(/"/g, ""))
        return {
            a: parts[0] ?? "",
            b: parts[1] ?? "",
            c: parts[2] ?? "",
            d: parts[3] ?? "",
            e: parts[4] ?? "",
            f: parts[5] ?? "",
            g: parts[6] ?? "",
            h: parts[7] ?? ""
        }
    }).filter((x, i) => i > 0)

export const parsedCategories = categoriesTxt
    .replace(/\r/g, "")
    .split('\n')
    .map(x => {
        const parts =
            x.split("\",\"").map(x => x.replace(/"/g, ""))
        return {
            a: parts[0] ?? "",
            b: parts[1] ?? ""
        }
    }).filter((x, i) => i > 0)

export const effects: Effect[] = parsedEffects
    .filter(x => x.a === "" && x.b !== "" && !x.b.startsWith("_"))
    .map(x => {
        const logic = {} as EffectLogic
        x.h.split(" ").forEach(entry => {
            const parts = entry.split(":")
            return logic[parts[0]] = parts[1]
        })
        return ({
            effect: x.b,
            text: x.c,
            power: parseFloat(x.d),
            witsAbility: x.e !== "",
            category: x.f,
            peopleOnlyAbility: x.g !== "",
            logic
        })
    })

export const effectsForTypes: Effect[] = parsedEffects
    .filter(x => x.a !== "" && x.b !== "" && !x.b.startsWith("-"))
    .map(x => ({
        type: x.a,
        effect: x.b
    }))

export const effectsTypeForCategory: EffectCategory[] = parsedCategories
    .filter(x => x.a !== "" && x.b !== "")
    .map(x => ({
        textPart: x.a,
        category: x.b
    }))

export const serverEffectsData = {effects, effectsForTypes, effectsTypeForCategory}
export default function handler(req, res) {
    res.status(200).json(serverEffectsData)
}
