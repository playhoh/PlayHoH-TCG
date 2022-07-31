export type AnalyzeResult = {
    name: string,
    displayName: string,
    typeLine: string,
    flavour?: string,
    img?: string,
    comment?: string,
    gen?: any
}

export type Card = {
    name: string,
    displayName: string,
    text: string,
    nftUrl?: string,
    typeLine: string,
    img: string,
    key: string,
    power: number | undefined,
    wits: number | undefined,
    cost: number,
    flavour: string,
    imgPos?: string,
    comment?: string,
    logic?: string,
    legacy?: boolean
}