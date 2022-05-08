export type CardData = {
    name: string,
    text: string,
    typeLine: string,
    set: string,
    wits: number | undefined,
    phys: number | undefined,
    cost: number,
    flavor: string,

    id?: string,
    img?: string,
    info?: string
    genStats?: any,
    physBuff?: number,
    witsBuff?: number,
    wikiImg?: string
}

export type Effect = {
    type?: string,
    effect: string,
    text?: string,
    power?: number,
    displayText?: string,
    triggerPowerFactor?: number,
    witsAbility?: boolean,
    category?: string
}

export type EffectCategory = {
    textPart: string,
    category: string
}

export type EffectsData = {
    effects: Effect[],
    effectsForTypes: Effect[],
    effectsTypeForCategory: EffectCategory[]
}