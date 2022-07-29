import {testMode} from "../src/testUtils"
import {trigger} from "../pages/api/trigger/[id]"

describe("dbpedia", () => {
    it("should fetch json",
        async () => {
            testMode()
            const mode = ["INGORE"][0] // i know, compiler :P

            if (mode === "started manually") {
                const res = await trigger()
                console.log("RES" + res)
            }
        })
})