import {testMode} from "../src/testUtils"
import {getFileJson} from "../src/server/staticData"
import {trigger} from "../pages/api/trigger/[id]"
import {getItemsFromCat} from "../src/server/dbpedia"

testMode()

describe("some items should be present", () => {
    it("popular people", async () => {
        let itemList = getFileJson('person.json').map(x => x.name)
            .slice(
                297 + 444
                + 691 + 981
            )
        console.log("people" + itemList.join("\n"))
        await trigger(true, itemList, true)
    })

    it("some Viking_ships", async () => {
        let itemList = await getItemsFromCat("Category:Viking_ships")
        console.log("ships" + itemList.join("\n"))
        await trigger(true, itemList, true)
    })

    it("some Ships_by_country", async () => {
        let itemList = await getItemsFromCat("Category:Ships_by_country")
        console.log("ships" + itemList.join("\n"))
        await trigger(true, itemList)
    })
})