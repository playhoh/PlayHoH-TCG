import {MORALIS_APP_ID, MORALIS_MASTER_KEY, MORALIS_SERVER_URL} from "../components/constants"
import {Count} from "../interfaces/baseTypes"
import {Api} from "./Api"
import {log} from "./utils"
import {ApiClient} from "./client/ApiClient"

let initialized = false

export function moralisSetup(master?: boolean) { // , _Moralis?: Moralis
    const _Moralis = Api //_Moralis || Moralis

    if (!initialized)
        log("moralisSetup " + (master ? "m" : "n-m"), " already initialized?", initialized)

    if (!initialized && MORALIS_APP_ID() && MORALIS_SERVER_URL()) {
        _Moralis.serverURL = MORALIS_SERVER_URL()
        try {
            _Moralis.initialize(MORALIS_APP_ID())
            initialized = true
            // debug("moralisSetup initialize done")
        } catch (e) {
            log("moralisSetup e", e)
        }
    } else {
        // debug("moralisSetup was already done " + _Moralis.serverURL)
    }
    if (master)
        _Moralis.masterKey = MORALIS_MASTER_KEY()
    else
        _Moralis.masterKey = undefined
}

/** returns if query needs to be refined further */
export function parseSearch(searchText: string, query: Api.Query): boolean {
    let ind = -1
    if ((ind = searchText.indexOf("id:")) >= 0) {
        query.equalTo("objectId", searchText.substring(ind))
        return false
    }
    return true
}

export async function getCount(): Promise<Count> {
    try {
        let query = new Api.Query('WikiPerson')
        query.exists('data')
        query.exists('data.img')
        query.notEqualTo("data.img", "")
        const people = (await query.count())
        query = new Api.Query('WikiObject')
        query.exists('data')
        query.exists('data.img')
        query.notEqualTo("data.img", "")
        const objects = (await query.count())
        query = new Api.Query("User")
        let users = await query.count({useMasterKey: true})
        return {users, cards: objects + people, objects, people}
    } catch (e) {
        log("getCount: " + e.toString())
        return {users: 0, cards: 0, objects: 0, people: 0}
    }
}

export async function processAllInQuery(className: string,
                                        q: (q: Api.Query) => void,
                                        f: (a: any, i: number) => Promise<void>, _Moralis?: any) {
    // moralisSetup(true, M)
    const query = new Api.Query(className)
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
