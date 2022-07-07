import {debug} from "../src/utils"
import {testMode} from "../src/testUtils"
import {trigger} from "../pages/api/trigger/[id]"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

export default {}
describe("dbpedia", () => {
    it("should fetch json",
        async () => {
            const res = await trigger()
            console.log("RES" + res)
        })
})