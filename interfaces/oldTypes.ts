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
    logic?: string,
    info?: string
    genStats?: any,
    physBuff?: number,
    witsBuff?: number,
    wikiImg?: string,

    displayName?: string,
    imgPos?: string
}

export type EffectLogicBuff = "w" | "W" | "p" | "P" | "2p" | "2w"

export type EffectLogicFor = "turn" | "once"

export type EffectLogicCost = "r" | "rr" | "rrr" | "rrrr" | "R" | "c" | "p" | "o"

export type EffectLogic = {
    for?: EffectLogicFor,
    draw?: string,
    scry?: string,
    to?: string,
    spy?: string,
    reduce?: string,
    buff?: EffectLogicBuff,
    value?: string,
    cost?: EffectLogicCost
}

export type Effect = {
    type?: string,
    effect: string,
    text?: string,
    trigger?: string,
    power?: number,
    displayText?: string,
    triggerPowerFactor?: number,
    witsAbility?: boolean,
    category?: string,
    peopleOnlyAbility?: boolean,
    logic?: EffectLogic
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
