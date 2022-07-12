import {debug} from "../src/utils"
import {testMode} from "../src/testUtils"
import {randomGenTime} from "../src/polygen"
import {generateValuesBasedOnCost} from "../src/dbpedia"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

describe("generateValuesBasedOnCost", () => {
    it("should not exceed the sum",
        async () => {
            const r = randomGenTime()
            const arr = []
            Array.from({length: 40}).map((_, i) => {
                const cost = 1 + Math.floor(i / 10)
                const upkeep = i % 2 == 0
                let {sum, wits, power} = generateValuesBasedOnCost(cost, upkeep, r)
                arr.push("found 👁 " + wits + " and ✊ " + power + " for △ " + cost + (upkeep ? "+upkeep1" : "") + " (sum " + sum + ")")
            })
            console.log(arr.join("\n"))
            // looks good
        })
})
