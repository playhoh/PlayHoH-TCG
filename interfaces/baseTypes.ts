export type Count = {
    cards?: number,
    users?: number,
    objects?: number,
    people?: number
}

export type Maybe<T> = T | undefined

export type CardFeedbackData = {
    name: string,
    feedback: string,
    field: string,
    vote: number
}