import {testMode} from "../src/testUtils"
import {getFileJson} from "../src/server/staticData"
import {trigger} from "../pages/api/trigger/[id]"

testMode()

describe("popular people", () => {
    it("should be present", async () => {

        const personList = getFileJson('person.json').map(x => x.name)
            .slice(
                297 + 444
                + 691 + 981
            )

        console.log("people" + personList.join("\n"))
        await trigger(true, personList)
    })
})