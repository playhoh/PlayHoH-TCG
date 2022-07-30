import {testMode} from "../src/testUtils"
import {isTooNew} from "../pages/api/trigger/[id]"

describe("face detection", () => {
    it("should work",
        async () => {
            testMode()

            const res = isTooNew("January or February 1548")
            expect(res).toEqual({y: "1548", tooNew: false, yearAsNumber: 1548})
        })
})
