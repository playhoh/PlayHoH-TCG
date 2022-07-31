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

const draw = (isLeave: boolean) => ["c",
    "draw a card",
    "draw 2 cards and discard one",
    "draw a card and discard one",
    !isLeave ? "draw a card, you may play an additional resource" : undefined
]

const cardChoice = ["c",
    "look at the top two cards of your deck and draw one of them"
]

const buff = (isPerson, isLeave) => ["c",
    ["s", "give ", anotherOrA(isPerson), " person +1 ", buffableAttr, " this turn"],
    isPerson && !isLeave ? ["s", "give this person +1 ", buffableAttr, " this turn"] : undefined,
    ["s", "give your people +1 ", buffableAttr, " this turn"],
    ["s", "double ", anotherOrA(isPerson), " person's ", buffableAttr, " this turn"]
]

const disable = isPerson => ["c",
    ["s", "nullify ", anotherOrA(isPerson), " person until your next turn"],
    ["s", "nullify ", anotherOrAn(!isPerson), " object until your next turn"],
    ["s", "nullify ", anotherOrA(isPerson), " person with ", attr, " ≤ 2 until your next turn"]
]

const resources = ["c",
    "you may play an additional resource",
    "you may play up to two additional resources"
]

const spy = ["c",
    "look at the enemy deck's top card",
    "look at the enemy deck's top card, you may put it under the deck"
]

const anotherOrA = isSameType => isSameType ? "another" : "a"

const anotherOrAn = isSameType => isSameType ? "another" : "an"

const protect = (toWording, isPerson) => ["c",
    toWording
        ? "prevent " + anotherOrA(isPerson) + " person from being ended until your next turn"
        : anotherOrA(isPerson) + " person cannot be ended until your next turn",
    toWording
        ? "prevent " + anotherOrAn(!isPerson) + " object from being ended until your next turn"
        : anotherOrAn(!isPerson) + " object cannot be ended until your next turn"
]

const bounce = (isLeave, isPerson) => ["c",
    !isLeave && isPerson ? "return this person to hand" : undefined,
    !isLeave && !isPerson ? "return this object to hand" : undefined,
    isLeave && isPerson ? "return another person to hand" : "return a person to hand",
    isLeave && !isPerson ? "return another object to hand" : "return an object to hand",
    "return one of your resources to hand",
    "return a resource to hand"
]

const reduce = toWording =>
    toWording
        ? "pay [R] less when you pay [R][R] or more this turn"
        : "when you pay [R][R] or more this turn, pay [R] less"


const slowDown = "your opponent can only spend their maximum [R] - 1 next turn"

const cost = ["c", "[R]", "[R][R]", "[R][R][R]"]
const costLow = ["c", "[R]", "[R][R]"]

//const reduceAttr =
//    ["s", "reduce a person's ", buffableAttr, " to 0 until your next turn"]

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
    // toWording ? undefined : "pay 3 [_] to draw a card",
    ["s", "gain ", num, " [_]"],
    ["s", toWording ? "let an opponent lose " : "an opponent loses ", num, " [_]"]
]

const genericEffects = (toWording: boolean, trigger: string, isPerson: boolean, isPay: boolean) => ["c",
    trigger !== "Main" ? destructive : undefined,
    trigger !== "Main" ? steal : undefined,
    draw(trigger === "Leave"),
    filter,
    buff(isPerson, trigger === "Leave"),
    disable(isPerson),
    !toWording && trigger !== "Leave" ? resources : undefined,
    trigger === "Main" ? spy : undefined,
    !isPay ? protect(toWording, isPerson) : undefined,
    trigger !== "Main" ? bounce(false, isPerson) : undefined,
    trigger === "Enter" ? reduce(toWording) : undefined,
    !toWording && trigger !== "Leave" ? slowDown : undefined,
    // reduceAttr,
    cardChoice,
    winPoints(toWording),
    !isPay ? add : undefined,
    returnDiscard(trigger === "Leave", isPerson)
]

const notPay = type => "Main: Pay [R] or end this " + type + "."

const staticEffects = ["c",
    "Opponents need to pay [R] to choose this card.",
    "You may reveal this card as you draw it to make it cost [R] less.",
    "Cannot be chosen by opponents.",
    "Your other people get +1 [W].",
    "Your other people get +1 [P]."
]

const forfeitType = (isPerson: boolean) => ["c",
    "a resource",
    "a hand card",
    isPerson ? "another person" : "a person",
    !isPerson ? "another object" : "an object"
]

const someCost = (trigger: string) =>
    ["c",
        trigger === "Leave" ? costLow : cost,
        ["s", num, " [_]"]
    ]

const triggerConditionOrCost = (trigger: string, isPerson: boolean) => ["c",
    ["s", "Pay ", someCost(trigger), " to ", genericEffects(true, trigger, isPerson, true), "."],
    ["s", "If your total [W] ≥ ", num, ", ", genericEffects(false, trigger, isPerson, false), "."],
    ["s", "You may forfeit ", forfeitType(isPerson), " to ", genericEffects(true, trigger, isPerson, true), "."],
]

const effectLine = (trigger: string, isPerson: boolean) => ["c",
    ["s", trigger, ": ", triggerConditionOrCost(trigger, isPerson)],
    ["s", trigger, ": ", ["u", genericEffects(false, trigger, isPerson, false)], "."],
]

export const personGrammar = ["c",
    effectLine("Enter", true),
    effectLine("Main", true),
    effectLine("Leave", true),
    ["s", notPay("person"), "\n", effectLine("Leave", true)],
    ["s", effectLine("Enter", true), "\n", effectLine("Main", true)],
    ["s", effectLine("Enter", true), "\n", effectLine("Leave", true)],
    staticEffects
]

export const objectGrammar = ["c",
    effectLine("Enter", false),
    effectLine("Main", false),
    effectLine("Leave", false),
    ["s", notPay("object"), "\n", effectLine("Leave", false)],
    ["s", effectLine("Enter", false), "\n", effectLine("Main", false)],
    ["s", effectLine("Enter", false), "\n", effectLine("Leave", false)],
    staticEffects
]