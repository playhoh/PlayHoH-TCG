import {debug} from "../src/utils"
import {testMode} from "../src/testUtils"
import {analyze, buildCardFromObj, getItemsFromCat, saveObj} from "../src/dbpedia"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

export default describe("dbpedia", () => {
    it("should fetch json",
        async () => {

            /* let a = await analyze("Kevin_Kelly_(editor)")
             debug("Kevin_Kelly", a)
             a = await analyze("Arminius")
             debug("Arminius", a)

             return*/

            const done = {}

            const toDo1 = [
                //"Kevin_Kelly_(editor)",
                //"Arminius",
                "Category:Independent_scientists",
                "List_of_German_physicists",
                "List_of_German_inventors_and_discoverers",
                "List_of_museums_in_Bern",
                "Category:Legendary_rulers",
                "List_of_regents_of_Greece",
                "List_of_Spanish_monarchs",
                "List_of_rulers_of_Japan",
                "Category:Viking_rulers",
                "Category:Scientists_by_field",
                "List_of_German_inventions_and_discoveries"
            ]
            const toDo = []
            for (const key in toDo1) {
                toDo.push(...(await getItemsFromCat(toDo1[key])))
            }

            while (toDo.length > 0) {
                const item = toDo.pop()

                if (!done[item]) {
                    done[item] = true
                    // let newItems = (await getItemsFromCat(item)).filter(x => !done[x])
                    // toDo.push(...newItems)
                }

                // for (const idx in items) {
                const x = await analyze(item)
                if (!x.img || !x.flavour || x.typeLine.includes("undefined")) {
                    console.log("sorry, ", x.name, " had no img or year or type: ", x, ". Not saved.")
                    continue
                }
                const res = await buildCardFromObj(x)
                const card = await saveObj(res)

                res.img = "<omitted in log>"

                console.log("res", item, "=>", res.name, "res", res)
            }
        })
})