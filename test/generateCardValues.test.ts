import {debug} from "../src/utils"
import {testMode} from "../src/testUtils"
import {randomGen, randomGenTime} from "../src/polygen"
import {generateValuesBasedOnCost} from "../src/server/dbpedia"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

describe("generateValuesBasedOnCost", () => {
    it("should not exceed the sum",
        async () => {
            const r = randomGen("fixedRandom")
            const arr = []
            Array.from({length: 40}).map((_, i) => {
                const cost = 1 + Math.floor(i / 10)
                const upkeep = i % 2 == 0
                let {sum, wits, power} = generateValuesBasedOnCost(cost, upkeep, r)
                arr.push("found 👁 " + wits + " and ✊ " + power + " for △ " + cost + (upkeep ? "+upkeep1" : "") + " (sum " + sum + ")")
            })
            expect(arr.join("\n"))
                .toEqual(`
found 👁 0 and ✊ 2 for △ 1+upkeep1 (sum 2)
found 👁 1 and ✊ 0 for △ 1 (sum 1)
found 👁 1 and ✊ 0 for △ 1+upkeep1 (sum 1)
found 👁 1 and ✊ 0 for △ 1 (sum 1)
found 👁 1 and ✊ 2 for △ 1+upkeep1 (sum 3)
found 👁 1 and ✊ 1 for △ 1 (sum 2)
found 👁 1 and ✊ 0 for △ 1+upkeep1 (sum 1)
found 👁 0 and ✊ 1 for △ 1 (sum 1)
found 👁 2 and ✊ 1 for △ 1+upkeep1 (sum 3)
found 👁 1 and ✊ 0 for △ 1 (sum 1)
found 👁 1 and ✊ 2 for △ 2+upkeep1 (sum 3)
found 👁 1 and ✊ 2 for △ 2 (sum 3)
found 👁 1 and ✊ 1 for △ 2+upkeep1 (sum 2)
found 👁 0 and ✊ 2 for △ 2 (sum 2)
found 👁 1 and ✊ 3 for △ 2+upkeep1 (sum 4)
found 👁 0 and ✊ 2 for △ 2 (sum 2)
found 👁 2 and ✊ 1 for △ 2+upkeep1 (sum 3)
found 👁 1 and ✊ 1 for △ 2 (sum 2)
found 👁 1 and ✊ 2 for △ 2+upkeep1 (sum 3)
found 👁 2 and ✊ 1 for △ 2 (sum 3)
found 👁 2 and ✊ 0 for △ 3+upkeep1 (sum 2)
found 👁 1 and ✊ 0 for △ 3 (sum 1)
found 👁 0 and ✊ 3 for △ 3+upkeep1 (sum 3)
found 👁 0 and ✊ 1 for △ 3 (sum 1)
found 👁 2 and ✊ 3 for △ 3+upkeep1 (sum 5)
found 👁 1 and ✊ 3 for △ 3 (sum 4)
found 👁 0 and ✊ 2 for △ 3+upkeep1 (sum 2)
found 👁 0 and ✊ 1 for △ 3 (sum 1)
found 👁 2 and ✊ 2 for △ 3+upkeep1 (sum 4)
found 👁 0 and ✊ 2 for △ 3 (sum 2)
found 👁 1 and ✊ 2 for △ 4+upkeep1 (sum 3)
found 👁 0 and ✊ 3 for △ 4 (sum 3)
found 👁 3 and ✊ 1 for △ 4+upkeep1 (sum 4)
found 👁 1 and ✊ 4 for △ 4 (sum 5)
found 👁 2 and ✊ 3 for △ 4+upkeep1 (sum 5)
found 👁 0 and ✊ 4 for △ 4 (sum 4)
found 👁 0 and ✊ 5 for △ 4+upkeep1 (sum 5)
found 👁 0 and ✊ 1 for △ 4 (sum 1)
found 👁 3 and ✊ 0 for △ 4+upkeep1 (sum 3)
found 👁 1 and ✊ 1 for △ 4 (sum 2)
`.trim())
        })
})
