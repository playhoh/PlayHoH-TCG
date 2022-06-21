import {debug} from "../../../src/utils"

//import RarepressNode from 'rarepress.node'
import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/client/baseApi"

const createNft = async (x) => {
    /*
    const rarepress = new RarepressNode()
    await rarepress.init({host: "https://rarepress.org/v0"})
    //for (let i = 0; i < 1000; i++) {
    const i = 1
    const txtPath = path.resolve('./public', 'static', 'card-back.svg')
    const svg = fs.readFileSync(txtPath, 'utf-8')
    debug("svg", svg)
    debug("rarepress.token", rarepress.token)

    // let cid = await rarepress.fs.add(Buffer.from(svg))
    moralisSetup(true, Moralis)
    const user = (await Moralis.User.logIn(SOME_MORALIS_USER, SOME_MORALIS_USER_PASSWORD)) as any
    debug("logged in as ", user)
    const imageFile = new Moralis.File("data.svg", {base64: toBase64(svg)})
    await imageFile.saveIPFS()

    // @ts-ignore
    const image = imageFile.ipfs()

    let token = await rarepress.token.create({
        metadata: {name: '${i}', description: '${i}.svg', image} //image: "ipfs/" + cid}
    })
    // await rarepress.fs.push(cid)
    // await rarepress.fs.push(token.uri)
    let sent = await rarepress.token.send(token)
    console.log(" published: https://rarible.com/token/" + sent.id)
    // }
    */
}

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    moralisSetup(true, Moralis)

    // const rarible = Moralis.Plugins.rarible
    const rarible = {test: 1}

    debug("Moralis.Plugins.rarible", rarible)
    // await createNft(id)
    res.status(200).end("Nice\n" + JSON.stringify(rarible, null, 2))
}
