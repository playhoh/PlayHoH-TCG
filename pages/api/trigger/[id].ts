import {MORALIS_SERVER_URL, TRIGGER_SECRET_KEY} from "../../../components/constants"
import {debug, log, now} from "../../../src/utils"
import {moralisSetup, processAllInQuery} from "../../../src/baseApi"
import Moralis from "moralis/node"
import {fetchWikiImageAndSaveAsFile} from "../../../src/cardCreation"

async function trigger() {
    // TODO: define chron job tasks
    // - fetching new people, objects from wikipedia
    // - loading images from wikipedia
    // - shove them into a neural network
    // - save the cards

    const rnd = Math.random() > 0.5
    const res = []
    const startTime = new Date().getTime()
    log("started task at " + now())
    let counter = 0
    let dl = 0
    moralisSetup(true, Moralis)

    debug("Moralis.serverURL", Moralis.serverURL)

    let className = rnd ? "WikiObject" : "WikiPerson"
    return await processAllInQuery(className, q => {
            // q.exists('data.wikitext')
            q.exists("data.img")
            q.notEqualTo("data.img", "")
        },
        item => {
            let name = item.get('name')
            //if (name !== "Arminius")
            //  return Promise.resolve()

            let data = item.get('data')
            let savedImg = item.get('img')?.url() ?? ""

            let img = data?.img
            res.push("item " + name + "\nWikiIMG " + img + "\nsavedImg " + savedImg)
            if (img && !savedImg.includes(MORALIS_SERVER_URL)) { // data?.img.includes("wikimedia") //  && !data.img) {
                debug("counter", counter, " data.img ", data.img)
                counter++
                img = img?.replace(/120px/g, "500px")
                // || img.includes(MORALIS_SERVER_URL))
                return !img ? Promise.resolve()
                    : fetchWikiImageAndSaveAsFile(img, name, item, {} as any, Moralis)
                        .then(x => {
                            return item.save().then(() => {
                                    dl++
                                    log("img downloaded + saved ", dl, "/", counter, " ", x)
                                }
                            )
                        })
                        .catch(x => {
                            log("ERR", x.toString())
                        })
            }
            return Promise.resolve()
        }, Moralis)
        .then(() => {
            let str = "done task for " + className + " in " + (new Date().getTime() - startTime) / 1000.0
                + "s, did these " + res.length + ":\n" + res.join("\n")
            log(str)
            return str
        })
}

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))

    let validKey = id === TRIGGER_SECRET_KEY
    log("api/trigger was called with validKey", validKey)

    if (validKey) {
        const str = await trigger()
        res.status(200).end(str)
    } else
        res.status(404).end("not found (404)")
}
