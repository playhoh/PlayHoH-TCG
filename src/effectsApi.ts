import {Effect, EffectsData} from "../interfaces/oldTypes"

export const getRelevantEffectsFor = (effectsObj: EffectsData) => (displayType: string): Effect[] => {
    if (!displayType)
        return

    displayType = displayType.toLowerCase()
    const forType = effectsObj.effectsForTypes.filter(x => x.type.toLowerCase() === displayType)
    return effectsObj.effects.filter(x => forType.find(y => y.effect === x.effect))
}

export const getRelevantEffectsForObjectCategory = (effectsObj: EffectsData) => (category: string): Effect[] => {
    if (!category)
        return

    category = category.toLowerCase()
    const forType = effectsObj.effectsTypeForCategory.filter(x => category.includes(x.textPart.toLowerCase()))

    return effectsObj.effects.filter(x => forType.find(y => y.category === x.category))
}