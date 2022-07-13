import {generateBoosterTakingFromArray, getAvailableCards} from "../src/server/boosterGeneration"
import {shuffle} from "../src/utils"
import {testMode} from "../src/testUtils"

describe("booster generation", () => {
    it("should work",
        async () => {
            testMode()
            const cardsAvailable = await getAvailableCards()
            console.log("cardsAvailable", cardsAvailable)

            shuffle(cardsAvailable)
            let size = 14
            const booster1 = generateBoosterTakingFromArray(cardsAvailable, size)
            const booster2 = generateBoosterTakingFromArray(cardsAvailable, size)
            console.log("generated boosters", {booster1, booster2})
        })
})
