import {Card} from "./cardTypes"
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
    enemyHand: Card[],
    enemyDeck: Card[],
    enemyDiscard: Card[],
    enemyField: Card[],
    enemyResources: Card[],
    yourField: Card[],
    yourResources: Card[],
    yourHand: Card[],
    yourDeck: Card[],
    yourDiscard: Card[],
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