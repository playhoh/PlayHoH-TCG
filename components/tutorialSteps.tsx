import {TutorialStepsData} from "../interfaces/gameTypes";

const interactive = true

export const tutorialSteps = [
    {
        id: "welcome",
        text: 'Welcome to HoH, the history card game!\n Press [Space] or click the "Got it!" button to continue.'
    },
    {
        id: "aboutVictoryPoints",
        text: "Here's how to play your first game.\nYou win a game by getting 20 victory points (■).\n" +
            "You get them in the end phase of your turn, but more on that later."
    },
    {
        id: "playResource",
        text: "Play cards from your hand as a resource (face down) to pay for other cards.\nLet's do that!"
    },
    {
        id: "playResourceDrag",
        text: "Drag Chief Joseph from your hand onto the Resource spot.",
        name: 'Chief Joseph',
        from: 'yourHand',
        to: 'yourResources',
        interactive,
        check: items => {
            // debug("check playResourceDrag", items.yourResources.map(x => x.name))
            return items.yourResources.find(x => x.name === "Chief Joseph")
        }
    },
    {
        id: "playCard",
        text: "Nice!\nLet's play a card from your hand.\n" +
            "The cost of a card is in the upper right: the number of triangle symbols.\n" +
            "You can only spend so much as you have resources in play."
    },
    {
        id: "playCardDrag",
        text: "Drag a card that costs one, such as Rain-in-the-Face, to the field.",
        name: 'Rain-in-the-Face',
        from: 'yourHand',
        to: 'yourField',
        interactive,
        check: items => items.yourField.find(x => x.name === "Rain-in-the-Face")
    },
    {
        id: "playCardOk",
        text: "Awesome!\nEach Person card has physical power (💪) and wits (👁) which are important " +
            "for other effects and gaining victory points."
    },
    {
        id: "passTurnOk",
        text: "That's it for your turn!\nYou can go to the next phase and get victory points!\n" +
            "Press [Space] or the NEXT button in the bottom left to go to the next phase.",
        interactive,
        check: items => items.phase >= 5
    },
    {
        id: "passTurnOk2",
        text: "You got one victory point (■), a player with 20 victory points wins the game.\n" +
            "Now pass the turn to your opponent.\n" +
            "Press [Space] or the NEXT button in the bottom left to go to the next phase.",
        interactive,
        check: items => items.phase === 0
    },
    {
        id: "enemyTurn",
        text: "That's how your turn looked like.\nLet's have a look at the opponent's turn.",
    },
    {
        id: "enemyTurnAuto",
        interactive,
        botBehavior: (setItems, setHints) => [
            items => {
                setItems({...items, phase: items.phase + 1})
            },
            () => setHints(x => ({...x, name: 'Chief Joseph', from: "enemyHand"})),
            items => {
                const newItems = {...items, enemyHand: [...items.enemyHand], enemyResources: [...items.enemyResources]}
                const card = newItems.enemyHand.find(x => x.name === "Chief Joseph")
                newItems.enemyResources.push(card)
                newItems.enemyHand = newItems.enemyHand.filter(x => x !== card)
                setItems(newItems)
            },
            () => setHints(x => ({...x, name: 'Rain-in-the-Face', from: "enemyHand"})),
            items => {
                const newItems = {...items, enemyHand: [...items.enemyHand], enemyField: [...items.enemyField]}
                const card = newItems.enemyHand.find(x => x.name === "Rain-in-the-Face")
                newItems.enemyField.push(card)
                newItems.enemyHand = newItems.enemyHand.filter(x => x !== card)
                setItems(newItems)
            },
            () => setHints(undefined),
            items => {
                setItems({...items, phase: items.phase + 1, enemyScore: items.enemyScore + 1})
            },
            items => {
                const newItems = {
                    ...items,
                    phase: items.phase + 1,
                    yourHand: [...items.yourHand],
                    yourDeck: [...items.yourDeck]
                }
                const card = newItems.yourDeck.pop()
                newItems.yourHand.push(card)
                setItems(newItems)
            },
        ],
    },
    {
        id: "enemyTurnAutoDone",
        text: "He just did the same thing as you:\n" +
            "playing a resource, playing a card, scoring, and passing the turn to you.\n" +
            "Now it's your turn and you're in your draw phase where you will draw a card.\n" +
            "Press [Space] or the NEXT button in the bottom left to go to the next phase.",
    },
    {
        id: "sencondTurnResource",
        text: "On your second turn, play another resource so you can play another card that costs two (࿋࿋).",
        name: "Tipi",
        from: "yourHand",
        to: "yourResources",
        check: items => items.yourResources.length >= 2,
        interactive
    },
    {
        id: "secondTurnCard",
        text: "Now play a card that's more powerful:\nCochise." +
            "\nHe will give all other people an additional power (💪).",
        name: "Cochise",
        from: "yourHand",
        to: "yourField",
        check: items => items.yourField.find(x => x.name === "Cochise"),
        interactive
    },
    {
        id: "secondTurnOk",
        text: "That's it for your turn!\nNow score by going to the next phase.\n" +
            "Press [Space] or the NEXT button in the bottom left to go to the next phase.",
        interactive,
        check: items => items.phase >= 5
    },
    {
        id: "done2",
        text: "That's the end of the tutorial. Now, go ahead an challenge another player." +
            "\nYou can find additional players in our discord.\nHave fun!",
        includeDiscordLink: true
    },
    {
        id: "end",
        interactive
    }
] as TutorialStepsData[]
