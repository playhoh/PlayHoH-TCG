import {buildCardFromObj} from "../src/dbpedia"

describe("Test", () => {
    it("buildCardFromObj", async () => {
        Array.from({length: 100}).forEach((_, i) => {
            const name = "Card " + i
            const typeLine = i % 5 === 0 ? "Archetype" : i % 2 === 0 ? "Person - XY" : "Object - Weapon"
            const obj = {name, typeLine} as any
            const res = buildCardFromObj(obj, true)
            console.log("buildCardFromObj: ", res)
        })
    })
})
