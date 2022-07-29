import {randomGen, runGrammar} from "../src/polygen"
import {archetypeGrammar, objectGrammar, personGrammar} from "../src/grammars"
import {splitIntoBox} from "../src/measureText"

function generateSomePhrasesFrom(grammar) {
    const done = {}
    Array.from({length: 2000}).forEach(i => {
        const grammarRes = runGrammar(grammar, randomGen("r" + new Date().toISOString() + "x" + i))
        const splitText = splitIntoBox(grammarRes)
        let res = splitText.map(x => x.text).join("\n")

        if (splitText.length <= 4 && !done[res]) {
            done[res] = true
            console.log(res) // grammarRes.replace("\n", "\\n") + "\n---\n" + res)
        }
    })
    return Object.keys(done)
}

describe("Test", () => {
    it("should run personGrammar",
        async () => {
            const res = generateSomePhrasesFrom(personGrammar)
            expect(res.length).toBeGreaterThan(25)
        })
    it("should run objectGrammar",
        async () => {
            const res = generateSomePhrasesFrom(objectGrammar)
            expect(res.length).toBeGreaterThan(25)
        })
    it("should run archetypeGrammar",
        async () => {
            const res = generateSomePhrasesFrom(archetypeGrammar)
            expect(res.length).toBeGreaterThan(10)
        })
})
