const num = ["c", "2", "3", "4"]

const attr = ["c", "[P]", "[W]", "cost"]

const condition = ["c",
    "if an opponent has no cards in hand",
    ["s", "if you drew ", num, " or more cards this turn"],
    ["s", "if you have 4 people with different ", attr],
    ["s", "if you have discarded ", num, " or more cards this turn"]
]

const forEach = ["c",
    "for each [P] of your people",
    "for each [W] of your people",
    "for each object in your discard pile",
    "for each revealed card of your opponent",
    "for each person you ended this turn",
    "for each card you returned to your hand this turn"
]

export const archetypeGrammar = ["c",
    ["s", "End: You get ", num, " [_] ", condition, "."],
    ["s", "End: You get [_] ", forEach, "."]
]

const buffableAttr = ["c", "[P]", "[W]"]

const destructive = ["c",
    "destroy an object",
    ["s", "end a person with ", buffableAttr, " ≤ ", num],
    "end a person",
    "destroy an object or end a person",
    "destroy a resource",
]

const steal = ["c",
    "gain control of a person",
    "gain control of an object",
]

const filter = ["c",
    "filter the top 3 cards of your deck for an object",
    ["s", "filter the top 3 cards of your deck for a card with cost ≤ ", num],
    "look at the top card of your deck, you may put it under the deck",
    ["s", "filter the top ", num, " cards of your deck for a person"],
]

const draw = ["c",
    "draw a card",
    "draw 2 cards and discard one",
    "draw a card and discard one",
    "draw a card, you may play an additional resource",
]

const cardChoice = ["c",
    "look at the top two cards of your deck and draw one of them"
]

const buff = anotherWording => ["c",
    ["s", "give a person +1 ", buffableAttr, " this turn"],
    anotherWording ? undefined : ["s", "give this person +1 ", buffableAttr, " this turn"],
    ["s", "give your people +1 ", buffableAttr, " this turn"],
    ["s", "double a person's ", buffableAttr, " this turn"],
]

const disable = ["c",
    "put a person out of action until your next turn",
    "put an object out of action until your next turn",
    ["s", "put a person with ", attr, " ≤ 2 out of action until your next turn"],
]

const resources = ["c",
    "you may play an additional resource",
    "you may play up to two additional resources",
]

const spy = ["c",
    "look at the enemy deck's top card",
    "look at the enemy deck's top card, you may put it under the deck",
]

const protect = toWording => ["c",
    toWording ? "prevent a person being ended until your next turn" : "a person cannot be ended until your next turn",
    toWording ? "prevent an object being ended until your next turn" : "an object cannot be ended until your next turn",
]

const bounce = (isLeave, isPerson) => ["c",
    !isLeave && isPerson ? "return this person to owner's hand" : undefined,
    !isLeave && !isPerson ? "return this object to owner's hand" : undefined,
    isLeave && isPerson ? "return another person to owner's hand" : "return a person to owner's hand",
    isLeave && !isPerson ? "return another object to owner's hand" : "return an object to owner's hand",
    "return one of your resources to your hand",
    "return a resource to owner's hand"
]

const reduce = "the next time you pay [R][R] or more, pay [R] less"

const slowDown = "your opponent can only spend their maximum [R] - 1 next turn"

const cost = ["c", "[R]", "[R][R]", "[R][R][R]"]

const reduceAttr =
    ["s", "reduce a person's ", buffableAttr, " to 0 until your next turn"]

const add = ["c",
    "add [R]",
    "add [R][R]"
]
const returnTarget = (isLeave, isPerson) => ["c",
    isLeave && !isPerson ? "another object" : "an object",
    isLeave && isPerson ? "another person" : "a person",
    isLeave ? "the next top card" : "the top card"
]
const returnDiscard = (isLeave, isPerson) => ["c",
    ["s", "return ", returnTarget(isLeave, isPerson), " from your discard pile to your hand"],
    ["s", "put ", returnTarget(isLeave, isPerson), " from your discard pile onto your deck"]
]

const winPoints = toWording => ["c",
    toWording ? undefined : "spend 3 [_] to draw a card",
    "gain 3 [_]",
    (toWording ? "let an opponent lose 3 [_]" : "an opponent loses 3 [_]"),
]

const genericEffects = (toWording?: boolean, trigger?: string, isPerson?: boolean, isPay?: boolean) => ["c",
    trigger !== "Main" ? destructive : undefined,
    trigger !== "Main" ? steal : undefined,
    draw,
    filter,
    buff(trigger === "Leave"),
    disable,
    toWording ? undefined : resources,
    spy,
    toWording ? undefined : protect,
    trigger !== "Main" ? bounce(trigger === "Leave", isPerson) : undefined,
    !toWording && trigger !== "Leave" ? reduce : undefined,
    !toWording && trigger !== "Leave" ? slowDown : undefined,
    reduceAttr,
    cardChoice,
    winPoints(toWording),
    isPay ? undefined : add,
    returnDiscard
]

const notPay = type => "Main: Pay [R] or end this " + type + "."

const staticEffects = ["c",
    "Opponents need to pay [R] to choose this card.",
    "You may reveal this card as you draw it to make it cost [R] less.",
    "Cannot be chosen by opponents.",
    "Your other people get +1 [W].",
    "Your other people get +1 [P]."
]

const forfeitType = ["c",
    "a resource",
    "a hand card",
    "a person",
    "an object"
]

const effectLine = (trigger: string, isPerson?: boolean) => ["c",
    trigger === "Leave" ? undefined : ["s", trigger, ": Pay ", cost, " to ", genericEffects(true, trigger, isPerson, true), "."],
    ["s", trigger, ": You may forfeit ", forfeitType, " to ", genericEffects(true, trigger, isPerson), "."],
    ["s", trigger, ": ", ["u", genericEffects(false, trigger, isPerson)], "."],
]

export const personGrammar = ["c",
    effectLine("Enter"),
    effectLine("Main"),
    effectLine("Leave"),
    ["s", notPay("person"), "\n", effectLine("Leave", true)],
    ["s", effectLine("Enter", true), "\n", effectLine("Main", true)],
    ["s", effectLine("Enter", true), "\n", effectLine("Leave", true)],
    staticEffects
]

export const objectGrammar = ["c",
    effectLine("Enter"),
    effectLine("Main"),
    effectLine("Leave"),
    ["s", notPay("object"), "\n", effectLine("Leave")],
    ["s", effectLine("Enter"), "\n", effectLine("Main")],
    ["s", effectLine("Enter"), "\n", effectLine("Leave")],
    staticEffects
]