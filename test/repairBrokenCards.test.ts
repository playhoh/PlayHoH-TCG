import {debug} from "../src/utils"
import {testMode} from "../src/testUtils"
import Moralis from "moralis/node"
import {analyze, buildCardFromObj} from "../src/dbpedia"

testMode()

debug("env", process.env.NEXT_PUBLIC_MORALIS_SERVER_URL)

describe("repair images and card text", () => {
    it("should work",
        async () => {
            const query = new Moralis.Query('Card')

            //query.startsWith('img', "data:image/jpeg;base64,PCFET0NUW")

            query.equalTo("text", "Enter: Pay [R] to destroy an object.")

            let arr: any[] = []
            let n = 0
            let res: any[] = undefined
            //while (res === undefined || res.length > 0) {
            res = await query.skip(n).find()
            const parts = []
            await Promise.all(res.map(async (x: any) => {
                const item = x.get('name')

                const analyzed = await analyze(item.replace(/ /g, '_'))
                console.log("item", item, "analyzed", analyzed)
                /*
                if (analyzed?.img) {
                    let url = convertImgUrl(analyzed.img)
                    const img = await downloadImgToBase64(url)
                    console.log("item ", item, " url", url, "b64.len", img.length)
                    //x.set('img', img)

                    //await x.save()
                    parts.push(x.get('name'))
                }
                */
                const {text} = await buildCardFromObj(analyzed, true)
                console.log("item ", item, "new text ", text)
                x.set('text', text)
                await x.save()
            }))
            arr = [...arr, ...parts]
            //n += 100
            console.log("n ", n)
            //}
            console.log("arr", arr)
        })
})
