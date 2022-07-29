import {parseWikiText} from "../src/wikiApi"
import {testMode} from "../src/testUtils"

testMode()
describe("WikiTest", () => {
    it("should parse low level parts #1", async () => {
        const res = parseWikiText("name", true,
            `'''XY''' is a german author that popularized drugs.`,
            "category")
        expect(res).toMatchObject(
            {
                category: "category",
                firstName: "name",
                isPerson: true,
                // longTypeLine: "german author that popularized drugs.",
                name: "name",
                typeLine: "german author that popularized drugs.",
                wikitext: "'''XY''' is a german author that popularized drugs."
            })
    })
})
