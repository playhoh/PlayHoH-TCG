import Moralis from "moralis/node"
import {moralisSetup} from "../../../src/client/baseApi"

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const x = id.split("?id=")[1] || ""

    function fail(x) {
        res.status(404).json({error: x})
    }

    if (!x) {
        fail("No username given")
        return
    }

    moralisSetup(true, Moralis)
    const query = new Moralis.Query(Moralis.User)
    query.equalTo("username", x)
    const findRes = await query.first({useMasterKey: true})
    if (!findRes) {
        fail("No user found for " + x)
        return
    }

    const wallet = (findRes.get('accounts') || [])[0]
    if (!wallet) {
        fail("User has no wallet, username " + x)
        return
    }

    try {
        const raribleApi = "https://api.rarible.org/v0.1/items/byOwner?owner=ETHEREUM%3A"
        const searchRes = await fetch(raribleApi + wallet, {
            headers: {
                "Transfer-Encoding": "chunked"
            }
        }).then(x => x.json())

        const cards = searchRes?.items.map(x => ({
            tokenId: x.tokenId,
            url: "https://rarible.com/token/" + wallet + ":" + x.tokenId + "?tab=details",
            supply: x.supply,
            ...(x.meta || {}),
            img: x?.content?.url
        }))

        res.status(200).json({result: cards, wallet})
    } catch (e) {
        fail(e.toString())
    }
}