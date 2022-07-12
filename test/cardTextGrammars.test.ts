import {randomGen, runGrammar} from "../src/polygen"
import {archetypeGrammar, objectGrammar, personGrammar} from "../src/grammars"

function generateSomePhrasesFrom(grammar) {
    const done = {}
    Array.from({length: 2000}).forEach(i => {
        const res = runGrammar(grammar, randomGen("r" + new Date().toISOString() + "x" + i))
        if (!done[res]) {
            done[res] = true
            console.log(res)
        }
    })
}

describe("Test", () => {
    it("should run archetypeGrammar",
        async () => {
            generateSomePhrasesFrom(archetypeGrammar)
        })
    it("should run personGrammar",
        async () => {
            generateSomePhrasesFrom(personGrammar)
        })
    it("should run objectGrammar",
        async () => {
            generateSomePhrasesFrom(objectGrammar)
        })
})
