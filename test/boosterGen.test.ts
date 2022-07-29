import {generateBoosterTakingFromArray, getAvailableCards} from "../src/server/boosterGeneration"
import {shuffle, toSet} from "../src/utils"
import {testMode} from "../src/testUtils"

describe("booster generation", () => {
    it("should work",
        async () => {
            testMode()
            const cardsAvailable = await getAvailableCards()
            console.log("cardsAvailable: ", cardsAvailable.length)

            shuffle(cardsAvailable)
            let size = 14
            const booster1 = generateBoosterTakingFromArray(cardsAvailable, size)
            const booster2 = generateBoosterTakingFromArray(cardsAvailable, size)
            const info = cards => cards.map(x => x.name + " (" + x.cost + ") - " + x.typeLine)

            console.log("generated boosters", {booster1: info(booster1), booster2: info(booster2)})

            expect(booster1.length).toEqual(14)

            expect(booster2.length).toEqual(14)

            // all unique
            expect(toSet(booster1.map(x => x.name)).length).toEqual(14)
            // no overlaps
            expect(booster2
                .filter(cardInB2 => booster1.find(cardInB1 => cardInB1.name === cardInB2.name))
            ).toEqual([])
        })
})
