import {MoralisProvider} from "react-moralis"
import React, {useEffect, useState} from "react"
import {Moralis} from "moralis"
import {MORALIS_APP_ID, MORALIS_SERVER_URL} from "../../components/constants"
import {debug} from "../utils"
import {moralisSetup} from "../baseApi"

export const HohApiWrapper = ({children}: React.PropsWithChildren<any>) => {
    /*    React.useEffect(() => {
            if (process.browser) {
                const old = RESTController.handleError
                RESTController.handleError = (e) => {
                    console.log("RESTController.handleError ", e)
                    // old(e)
                }

            }
        }, [])
    */
    const [isBrowser, setBrowser] = React.useState(false)
    useEffect(() => {
        let res = !!(typeof window)
        setBrowser(res)
    }, [])

    const [err, setErr] = React.useState("")
    const [loaded, setLoaded] = React.useState(false)
    const allKeys = {
        MORALIS_APP_ID, MORALIS_SERVER_URL
    }
    const unavailable = Object.keys(allKeys).filter(x => (allKeys[x]?.length ?? 0) === 0)

    if (unavailable.length === 0 && err === "")
        return <MoralisProvider appId={MORALIS_APP_ID} serverUrl={MORALIS_SERVER_URL}>
            <MoralisDappProvider onErr={setErr} onLoaded={setLoaded}>
                {loaded && isBrowser ? children : <div>{err || "Loading..."}</div>}
            </MoralisDappProvider>
        </MoralisProvider>
    else {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                {err
                    ? <b>{err.toString()}</b>
                    : <>
                        <b>CONFIG ERROR: Keys not found!</b>
                        <br/>
                        {unavailable.join(", ")}
                    </>}
                <div>loaded {loaded.toString()}</div>
            </div>
        )
    }
}

const MoralisDappContext = React.createContext(undefined)

interface MoralisDappProviderProps extends React.PropsWithChildren<any> {
    onLoaded?: Function,
    onErr?: (e: string) => void
}

function MoralisDappProvider({children, onLoaded, onErr}: MoralisDappProviderProps) {
//    const {web3, Moralis, user} = useMoralis()
    const [walletAddress, setWalletAddress] = useState()
    const [chainId, setChainId] = useState()
    const [contractABI, setContractABI] = useState('{"noContractDeployed": true}') //Smart Contract ABI here
    const [marketAddress, setMarketAddress] = useState() //Smart Contract Address Here

    useEffect(() => {
        /*Moralis.Web3API.token
            .getTokenPrice({address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", chain: "bsc"})
            .then(x => console.log("getTokenPrice", x))*/
        try {
            /*Moralis.onChainChanged(function (chain) {
                setChainId(chain)
            })

            Moralis.onAccountsChanged(function (address) {
                setWalletAddress(address[0])
            })*/
            if (process.browser) {

                debug("mor ver", Moralis.CoreManager.get("VERSION"))
                moralisSetup()
                if (onLoaded)
                    onLoaded(true)
                /*
                Moralis.Config.get().then(config => {
                    //
                    try {
                        console.log("config", config)
                        if (onLoaded)
                            onLoaded(true)
                    } catch (e) {
                        debug("e2", e)
                    }
                }).catch(e => debug("err3", e))*/
            }
        } catch (e) {
            console.log("err", e)
            if (onErr)
                onErr(e)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    /*useEffect(() => setChainId(web3.givenProvider?.chainId))
    useEffect(
        () => setWalletAddress(web3.givenProvider?.selectedAddress || user?.get("ethAddress")),
        [web3, user]
    )*/

    return (
        <MoralisDappContext.Provider
            value={{walletAddress, chainId, marketAddress, setMarketAddress, contractABI, setContractABI}}>
            {children}
        </MoralisDappContext.Provider>
    )
}

export function useMoralisDapp() {
    const context = React.useContext(MoralisDappContext)
    if (context === undefined) {
        throw new Error("useMoralisDapp must be used within a MoralisDappProvider")
    }
    return context
}