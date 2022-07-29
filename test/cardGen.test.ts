import {buildCardFromObj} from "../src/server/dbpedia"
import {toSet} from "../src/utils"

describe("Test card generation", () => {
    it("should work using buildCardFromObj", async () => {
        const cards =
            await Promise.all(Array.from({length: 1000}).map((_, i) => {
                const name = "Card " + i
                const typeLine = i % 5 === 0 ? "Archetype" : i % 2 === 0 ? "Person - XY" : "Object - Weapon"
                const obj = {name, typeLine} as any
                return buildCardFromObj(obj, true)
            }))

        const filter = f => cards.filter(x => x.typeLine.startsWith(f))
        expect(filter("Archetype").length).toEqual(200)
        expect(filter("Person - ").length).toEqual(400)
        expect(filter("Object - ").length).toEqual(400)

        // this could fail super rarely when randomness leaves out a number in 1000 tries
        // it will fail if somebody destroys the logic for costs and stats, that's why it's here (safety net)
        expect(toSet(cards.map(x => x.cost)).sort()).toEqual([1, 2, 3, 4])
        expect(toSet(cards.map(x => x.wits)).sort()).toEqual([0, 1, 2, 3, 4, 5, undefined])
        expect(toSet(cards.map(x => x.power)).sort()).toEqual([0, 1, 2, 3, 4, 5, undefined])
    })
})
