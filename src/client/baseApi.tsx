import {MoralisProvider} from "react-moralis"
import React, {useEffect, useState} from "react"
import {Moralis} from "moralis"
import {MORALIS_APP_ID, MORALIS_MASTER_KEY, MORALIS_SERVER_URL} from "../../components/constants"
import {debug, log} from "../utils"
import type {Count} from "../../interfaces/baseTypes"

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

export function moralisSetup(master?: boolean, _Moralis?: Moralis) {
    _Moralis = _Moralis || Moralis
    console.log("moralisSetup " + (master ? "m" : "n-m"))
    if (!_Moralis.isInitialized) {
        _Moralis.serverURL = MORALIS_SERVER_URL
        try {
            _Moralis.initialize(MORALIS_APP_ID)
            // debug("moralisSetup initialize done")
        } catch (e) {
            log("moralisSetup e", e)
        }
    } else {
        // debug("moralisSetup was already done " + _Moralis.serverURL)
    }
    if (master)
        _Moralis.masterKey = MORALIS_MASTER_KEY
    else
        _Moralis.masterKey = undefined
}

/** returns if query needs to be refined further */
export function parseSearch(searchText: string, query: Moralis.Query): boolean {
    let ind = -1
    if ((ind = searchText.indexOf("id:")) >= 0) {
        query.equalTo("objectId", searchText.substring(ind))
        return false
    }
    return true
}

export async function getCount(): Promise<Count> {
    try {
        let query = new Moralis.Query('WikiPerson')
        query.exists('data')
        query.exists('data.img')
        query.notEqualTo("data.img", "")
        const people = (await query.count())
        query = new Moralis.Query('WikiObject')
        query.exists('data')
        query.exists('data.img')
        query.notEqualTo("data.img", "")
        const objects = (await query.count())
        query = new Moralis.Query(Moralis.User)
        let users = await query.count({useMasterKey: true})
        return {users, cards: objects + people, objects, people}
    } catch (e) {
        log("getCount: " + e.toString())
        return {users: 0, cards: 0, objects: 0, people: 0}
    }
}

export async function processAllInQuery(className: string,
                                        q: (q: Moralis.Query) => void,
                                        f: (a: any, i: number) => Promise<void>) {
    moralisSetup(true, Moralis)
    const query = new Moralis.Query(className)
    q(query)
    const n = 100

    async function iter(i) {
        const results = await query.skip(i).limit(n).find()
        if (results.length > 0) {
            await Promise.all(results.map((x, k) => {
                return f(x, k)
            }))

            await iter(i + n)
        } else {
            console.log("done! @" + i)
        }
    }

    await iter(0)
}
