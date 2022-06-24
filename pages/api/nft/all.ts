//import Moralis from "moralis/node"
//import {moralisSetup} from "../../../src/client/baseApi"

const raribleApi = "https://api.rarible.org/v0.1/items/byOwner?owner=ETHEREUM%3A"
const creatorUserId = "0xcfbd41042f2b0896999bf22c3bf1b348122adcdf"

export default async function handler(req, res) {
    // const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    // moralisSetup(true, Moralis)

    try {
        const searchRes = await fetch(raribleApi + creatorUserId, {
            headers: {
                "Transfer-Encoding": "chunked"
            }
        }).then(x => x.json())

        res.status(200).json(
            searchRes?.items.map(x => ({
                tokenId: x.tokenId,
                url: "https://rarible.com/token/" + creatorUserId + ":" + x.tokenId + "?tab=details",
                supply: x.supply,
                ...(x.meta || {}),
                img: x?.content?.url
            }))
        )
    } catch (e) {
        res.status(404).json({error: e.toString()})
    }
}
