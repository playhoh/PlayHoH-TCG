import {testMode} from "../src/testUtils"
import {trigger} from "../pages/api/trigger/[id]"

export default {}
describe("dbpedia", () => {
    it("should fetch json",
        async () => {
            testMode()

            const res = await trigger()
            console.log("RES" + res)
        })
})