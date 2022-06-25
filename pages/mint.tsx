import React from 'react'
import {useUser} from "../src/client/userApi"
import {Moralis} from "moralis"
import {BASE_URL, debug} from "../src/utils"
import {queryCardsToMint} from "../src/client/cardApi"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {gameName} from "../components/constants"
import {cardImgUrlForName, getNiceCardUrl} from "../src/cardData"
import {Button, Tooltip} from "@mui/material"
import {InfoOutlined} from "@mui/icons-material"

function auth() {
    // @ts-ignore
    return Moralis.authenticate()
}

function makeImage(imgUrl: any, withImg: (image) => void) {
    const pngImage = document.createElement('img')
    const svgImage = document.createElement('img')

    svgToPng(imgUrl, withImg)

    function svgToPng(imgUrl, callback) {
        svgUrlToPng(imgUrl, (imgData) => {
            callback(imgData)
        })
    }

    function svgUrlToPng(svgUrl, callback) {
        // imgPreview.style.position = 'absolute'
        // imgPreview.style.top = '-9999px'
        document.body.appendChild(svgImage)
        document.body.appendChild(pngImage)
        svgImage.onload = function () {
            const canvas = document.createElement('canvas')
            canvas.width = svgImage.clientWidth
            canvas.height = svgImage.clientHeight
            const canvasCtx = canvas.getContext('2d')
            canvasCtx.drawImage(svgImage, 0, 0)
            const imgData = canvas.toDataURL('image/png')
            callback(imgData)
            // document.body.removeChild(imgPreview)
            document.body.removeChild(svgImage)
            document.body.removeChild(pngImage)
        }

        svgImage.src = svgUrl
    }
}

export function MintLogic() {
    const {user, isAuthenticated} = useUser()
    const [res, setRes] = React.useState({})
    const [unmintedObjects, setUnmintedObjects] = React.useState([])

    React.useEffect(() => {
        setUnmintedObjects([])

        fetch("/api/badWords").then(x => x.json()).then(badWords =>
            queryCardsToMint(true, f => {
                setUnmintedObjects(f)
                queryCardsToMint(false, f2 => {
                    setUnmintedObjects([...f2, ...f])
                }, badWords)
            }, badWords))
    }, [])

    function mintAll(i: number) {
        const item = unmintedObjects[i]
        if (item)
            mint(item, () => mintAll(i + 1))
        else
            setUnmintedObjects([])
    }

    function mint(obj, thenDo?: () => void) {
        makeImage(cardImgUrlForName(obj.name) + "&n=1", image => {
            let imgBase64 = image.substring(image.indexOf(";base64,") + ";base64,".length)
            debug("img", imgBase64)
            const file = new Moralis.File("file.png", {base64: imgBase64})
            debug("file", file)
            file.saveIPFS().then(() => {
                // @ts-ignore
                const imageUrl = file.ipfs()
                debug("imageUrl", imageUrl)
                if (isAuthenticated) {
                    const address = user.accounts && user.accounts[0]
                    if (address) {
                        // @ts-ignore
                        Moralis.enableWeb3()
                            .then(() => mintPng(obj, imageUrl, address))
                        return
                    }
                }

                auth().then(user => {
                    let userAddress = user.get && user.get('ethAddress')
                    return mintPng(obj, imageUrl, userAddress)
                        .then(() => thenDo && thenDo())
                })
            })
        })
    }

    async function mintPng(obj, image, userAddress) {
        setRes(r => ({...r, userAddress}))

        //const imageFile = new Moralis.File(data.name, data)
        //await imageFile.saveIPFS()

        let cardData = obj.cardData
        const name = cardData.id || cardData.name

        if (!image || !name)
            return

        const description = getNiceCardUrl(obj.key)

        let attributes = [
            {
                "trait_type": "Type",
                "value": cardData.type
            },
            {
                "trait_type": "Game",
                "value": "HoH"
            },
            {
                "trait_type": "ID",
                "value": name
            }
        ]
        const metaData = {
            name,
            image,
            description,
            date: new Date().getTime(),
            attributes
        }
        const file = new Moralis.File("file.json",
            {base64: btoa(JSON.stringify(metaData, null, 2))})
        await file.saveIPFS()

        // @ts-ignore
        let ipfsUrl = file.ipfs()

        setRes(r => ({...r, ipfs: image}))
        debug("ipfsUrl", ipfsUrl)

        // @ts-ignore
        const rarible = Moralis.Plugins.rarible

        const res = await rarible.lazyMint({
            chain: 'eth',
            userAddress: userAddress,
            tokenType: 'ERC1155',
            tokenUri: ipfsUrl,
            list: true, // only if lazy listing
            listTokenAmount: 10, // only if lazy listing
            listTokenValue: (10 ** 15) / 5,
            // ~ 20cent
            // 1 ETH is 10 ** 18, 10 ** 15 == 1€ // only if lazy listing
            listAssetClass: 'ETH', // only if lazy listing || optional
            supply: 10,
            royaltiesAmount: 1000, // 10% royalty. Optional
        })

        let apiResult = res.triggers.find(x => x.params?.makeTokenId).params
        debug("res", res)
        const resultId = (apiResult.makeTokenAddress + ":" + apiResult.makeTokenId).toLowerCase()

        const url = "https://rarible.com/token/" + resultId + "?tab=details"
        obj.set('needsMinting', false)
        obj.set('nftUrl', url)
        await obj.save()

        setRes(r => ({...r, res, obj}))
    }

    return !user.isAdmin ? <AskAnAdmin/> : <div>
        <h1>Mint NFTs</h1>

        <pre style={{fontSize: "40%"}}>{ahkScript}</pre>

        <Button onClick={() => mintAll(0)}>
            {'Mint All'}
        </Button>

        {unmintedObjects.map(obj =>
            <div key={obj.name} style={{display: "flex"}}>
                <img src={obj.name && cardImgUrlForName(obj.name) + "&n=1"} alt="" width="200"/>
                <div>
                    {obj.cardData?.displayName}
                    <br/>
                    ID={obj.name}
                    <br/>
                    <Tooltip title={JSON.stringify(obj, null, 2)}>
                        <InfoOutlined/>
                    </Tooltip>
                    <br/>
                    <Button onClick={() => mint(obj)}>
                        Mint
                    </Button>
                </div>
            </div>)}

        State:
        <br/>
        <pre>{JSON.stringify(res, null, 2)}</pre>
    </div>
}

export default function ShopPage() {
    return (
        <Layout title={gameName("Minting")} noCss mui>
            <HohApiWrapper>
                <MintLogic/>
            </HohApiWrapper>
        </Layout>
    )
}

const ahkScript = `
; Get AHK for automated input in metamask https://portableapps.com/node/39299
#z::
IfWinExist MetaMask Notification
{
WinActivate
MouseMove, 300, 560
sleep, 1000
Send {Click 300 560}
sleep, 5000

MouseMove, 300, 523
sleep, 1000
Send {Click 300 523}
sleep, 1000

MouseMove, 300, 570
sleep, 1000
Send {Click 300 570}
sleep, 5000

MouseMove, 300, 523
sleep, 1000
Send {Click 300 523}
sleep, 1000

MouseMove, 300, 570
sleep, 1000
Send {Click 300 570}
sleep, 2000

}
else
Run ` + BASE_URL + `/mint
return`
