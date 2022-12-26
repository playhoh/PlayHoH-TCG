import React from 'react'
import {useUser} from "../src/client/userApi"
import {Api} from "../src/Api"
import {debug} from "../src/utils"
import {queryCardsToMint} from "../src/client/cardApi"
import {AskAnAdmin} from "../components/AskAnAdmin"
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/clientApi"
import {gameName} from "../components/constants"
import {cardImgUrlForName, getNiceCardUrl} from "../src/cardData"
import {Button, Tooltip} from "@mui/material"
import {CheckCircleOutlined, InfoOutlined} from "@mui/icons-material"
import {LoginFirst} from "../components/LoginFirst"

const authenticate = () => Promise.resolve({} as any)

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

export function MinterLogic() {
    const {user, isAuthenticated} = useUser()
    const [res, setRes] = React.useState({})
    const [done, setDone] = React.useState({})
    const [unmintedObjects, setUnmintedObjects] = React.useState([])
    // const {authenticate} = useMoralis()

    React.useEffect(() => {
        setUnmintedObjects([])
        queryCardsToMint(f => setUnmintedObjects(f))
    }, [])

    function mintAll(i: number) {
        if (i == 0) {
            setDone({})
        }
        const item = unmintedObjects[i]
        if (item && !item?.done)
            mint(item, () => {
                mintAll(i + 1)
            })
        else
            setUnmintedObjects([])
    }

    function mint(obj, thenDo?: () => void) {
        makeImage(cardImgUrlForName(obj.name) + "&n=1", image => {
            let imgBase64 = image.substring(image.indexOf(";base64,") + ";base64,".length)
            debug("img", imgBase64)
            const file = new Api.File("file.png", {base64: imgBase64})
            debug("file", file)
            file.saveIPFS().then(() => {
                // @ts-ignore
                const imageUrl = file.ipfs()
                debug("imageUrl", imageUrl)
                if (isAuthenticated) {
                    const address = user.accounts && user.accounts[0]
                    if (address) {
                        // @ts-ignore
                        Api.enableWeb3()
                            .then(() => mintPng(obj, imageUrl, address))
                        return
                    }
                }

                authenticate().then(user => {
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
        const name = cardData.name

        if (!image || !name)
            return

        const description = getNiceCardUrl(obj.key)

        let attributes = [
            !cardData.typeLine ? undefined : {
                "trait_type": "Type",
                "value": cardData.typeLine
            },
            {
                "trait_type": "Game",
                "value": "HoH"
            },
            {
                "trait_type": "ID",
                "value": name
            }
        ].filter(x => x)
        const metaData = {
            name,
            image,
            description,
            date: new Date().getTime(),
            attributes
        }
        const file = new Api.File("file.json",
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
        setDone(old => ({...old, [obj.name]: true}))
    }

    return !isAuthenticated ? <LoginFirst/>
        : !user.isAdmin ? <AskAnAdmin/>
            : <div>
                <h1>{'Mint NFTs'}</h1>

                <pre style={{fontSize: "40%"}}>{ahkScript}</pre>

                <Button onClick={() => mintAll(0)}>
                    {'Mint All'}
                </Button>

                {unmintedObjects.map(obj =>
                    <div key={obj.name} style={{display: "flex"}}>
                        <img src={obj.name && cardImgUrlForName(obj.name) + "&n=1"} alt="" width="200"/>
                        <div>
                            {done[obj.name] && <div>
                                <CheckCircleOutlined/>
                                {'DONE: '}
                            </div>}{obj.cardData?.displayName}
                            <br/>
                            ID={obj.name}
                            <br/>
                            <Tooltip title={JSON.stringify(obj, null, 2)}>
                                <InfoOutlined/>
                            </Tooltip>
                            <br/>
                            <Button onClick={() => mint(obj)}>
                                {'Mint'}
                            </Button>
                        </div>
                    </div>)}

                {'State:'}
                <br/>
                <pre>{JSON.stringify(res, null, 2)}</pre>
            </div>
}

export default function MinterPage() {
    return (
        <Layout title={gameName("Minting")} noCss mui>
            <HohApiWrapper>
                <MinterLogic/>
            </HohApiWrapper>
        </Layout>
    )
}

const ahkScript = `
; Get AHK for automated input in metamask https://portableapps.com/node/39299
#z::
Loop {
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
        if GetKeyState("Shift")
          return

        sleep, 7000

        if GetKeyState("Shift")
          return
}`
