import {MORALIS_SERVER_URL, TRIGGER_SECRET_KEY} from "../../../components/constants"
import {debug, log} from "../../../src/utils"
import {moralisSetup, processAllInQuery} from "../../../src/client/baseApi"
import Moralis from "moralis/node"
import {fetchWikiImageAndSaveAsFile} from "../../../src/cardCreation"

function trigger() {
    // TODO: define chron job tasks
    // - fetching new people, objects from wikipedia
    // - loading images from wikipedia
    // - shove them into a neural network
    // - save the cards

    const rnd = Math.random() > 0.5
    const serverId = MORALIS_SERVER_URL
    const res = []
    const startTime = new Date().getTime()
    log("started task at " + new Date())
    let counter = 0
    let dl = 0
    moralisSetup(true, Moralis)

    debug("Moralis.serverURL", Moralis.serverURL)

    let className = rnd ? "WikiObject" : "WikiPerson"
    processAllInQuery(className, q => {
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
            log("done task for " + className + " in " + (new Date().getTime() - startTime) / 1000.0
                + "s, did these " + res.length + ":\n" + res.join("\n"))
        })
}

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))

    let validKey = id === TRIGGER_SECRET_KEY
    log("api/trigger was called with validKey", validKey)

    if (validKey) {
        trigger()
        res.status(200).json({ok: true})
    } else
        res.status(404).json({ok: false})
}
