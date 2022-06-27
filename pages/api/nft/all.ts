const raribleApi = "https://api.rarible.org/v0.1/items/byCreator?creator=ETHEREUM%3A"
const creatorUserId = "0xcfbd41042f2b0896999bf22c3bf1b348122adcdf"
const collectionId = "0xb66a603f4cfe17e3d27b87a8bfcad319856518b8"

export default async function handler(req, res) {
    try {
        const searchRes = await fetch(raribleApi + creatorUserId, {
            headers: {
                "Transfer-Encoding": "chunked"
            }
        }).then(x => x.json())

        res.status(200).json(
            searchRes?.items.map(x => ({
                tokenId: x.tokenId,
                url: "https://rarible.com/token/" + collectionId + ":" + x.tokenId + "?tab=details",
                supply: x.supply,
                ...(x.meta || {}),
                img: x?.content?.url,
                // more: x
            }))
        )
    } catch (e) {
        res.status(404).json({error: e.toString()})
    }
}
