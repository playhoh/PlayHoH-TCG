import React from 'react'
import {useUser} from "../src/client/userApi"
import {Button} from "@mui/material"
import {Moralis} from "moralis"
import {debug} from "../src/utils"
import {FileUpload} from "@mui/icons-material"
import Layout from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {gameName} from "../components/constants"

function auth() {
    // @ts-ignore
    return Moralis.authenticate()
}

export function ShopLogic() {
    const {user, isAuthenticated} = useUser()
    const [res, setRes] = React.useState({})
    const [selectedFiles, setFiles] = React.useState(undefined)

    async function mintTokenWithAdress(userAddress) {
        debug("userAddress", userAddress)
        setRes(r => ({...r, userAddress}))

        let data = selectedFiles[0]
        const imageFile = new Moralis.File(data.name, data)
        await imageFile.saveIPFS()

        // @ts-ignore
        const image = imageFile.ipfs()
        const name = data.name.substring(0, data.name.lastIndexOf('.'))

        const description = "PlayHoH.com card"
        let attributes = [
            {
                "trait_type": "Type",
                "value": "Person - Indian chief"
            }
        ]
        const metaData = {
            name,
            image,
            description,
            date: new Date().getTime(),
            attributes
        }
        const file = new Moralis.File("file.json", {base64: btoa(JSON.stringify(metaData, null, 4))})
        await file.saveIPFS()

        // @ts-ignore
        let ipfsUrl = file.ipfs()

        setRes(r => ({...r, ipfs: imageFile}))
        debug("ipfsUrl", ipfsUrl)

        // @ts-ignore
        const rarible = Moralis.Plugins.rarible

        const res = await rarible.lazyMint({
            chain: 'eth',
            userAddress: userAddress,
            tokenType: 'ERC1155',
            tokenUri: ipfsUrl,
            list: true, // only if lazy listing
            listTokenAmount: 3, // only if lazy listing
            listTokenValue: 10 ** 17, // 59 ** 13, // 1 ETH is 10 ** 18, //  = 0.0005903, // only if lazy listing == 1€
            listAssetClass: 'ETH', // only if lazy listing || optional
            supply: 100,
            royaltiesAmount: 5, // 0.05% royalty. Optional
        })
        debug("res", res)
        setRes(r => ({...r, res}))
    }

    return <div>
        <h1>Mint NFT</h1>
        <label htmlFor="btn-upload">
            <input
                id="btn-upload"
                name="btn-upload"
                style={{display: 'none'}}
                type="file"
                onChange={event => setFiles(event.target.files)}/>
            <Button
                className="btn-choose"
                variant="outlined"
                component="span">
                <FileUpload/> Choose Files
            </Button>

            <div className="file-name">
                {selectedFiles && selectedFiles.length > 0 ? selectedFiles[0].name : null}
            </div>
        </label>

        {selectedFiles && <Button onClick={() => {
            if (isAuthenticated) {
                const address = user.accounts && user.accounts[0]
                if (address) {
                    // @ts-ignore
                    Moralis.enableWeb3()
                        .then(() => mintTokenWithAdress(address))
                    return
                }
            }

            auth().then(user => {
                let userAddress = user.get && user.get('ethAddress')
                return mintTokenWithAdress(userAddress)
            })
        }}>
            Mint
        </Button>}

        State:
        <pre>
            selectedFiles {JSON.stringify(selectedFiles, null, 2)}
            res {JSON.stringify(res, null, 2)}
        </pre>
    </div>
}

export default function ShopPage() {
    return (
        <Layout title={gameName("Home")} noCss gameCss mui>
            <HohApiWrapper>
                <ShopLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
