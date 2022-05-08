import {Effect, EffectsData} from "../interfaces/cardTypes"

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
    //debug(category, " eff forType: ", forType)
    //debug("effects types", effects.map(x => x.category).join(", "))
    return effectsObj.effects.filter(x => forType.find(y => y.category === x.category))
}