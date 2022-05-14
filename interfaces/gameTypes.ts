import {CardData} from "./cardTypes"
import {Dispatch, SetStateAction} from "react"
import {Maybe} from "./baseTypes"

export type ZoneId =
    "enemyStats"
    | "enemyHand"
    | "enemyDeck"
    | "enemyDiscard"
    | "enemyField"
    | "enemyResources"
    | "yourStats"
    | "yourHand"
    | "yourDeck"
    | "yourDiscard"
    | "yourField"
    | "yourResources"

export type Zone = {
    id: ZoneId,
    isEnemy?: boolean,
    isStats?: boolean,
    isHidden?: boolean,
    isHand?: boolean,
    isDeck?: boolean,
    isDiscard?: boolean,
    isResource?: boolean,
    showSingle?: boolean
}

export type Objective = {
    text: string,
    logic: string
}

export type GameState = {
    phase: number,
    enemyScore: number,
    yourScore: number,
    enemyHand: CardData[],
    enemyDeck: CardData[],
    enemyDiscard: CardData[],
    enemyField: CardData[],
    enemyResources: CardData[],
    yourField: CardData[],
    yourResources: CardData[],
    yourHand: CardData[],
    yourDeck: CardData[],
    yourDiscard: CardData[],
    player1: string,
    player2: string,
    yourObjective: Objective,
    enemyObjective: Objective,
    createdAt?: any
}

export type TutorialStepsData = {
    id: string,
    text: string,
    name: string,
    from?: string,
    to?: string,
    interactive?: boolean,
    includeDiscordLink?: boolean,
    shouldPass?: boolean,
    check?: (items: GameState) => boolean,
    botBehavior?: (
        setItems: Dispatch<SetStateAction<GameState>>,
        setHints: Dispatch<SetStateAction<Maybe<TutorialStepsData>>>
    ) => ((items: GameState) => void)[]
}