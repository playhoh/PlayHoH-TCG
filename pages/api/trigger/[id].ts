import {TRIGGER_SECRET_KEY} from "../../../components/constants"
import {log} from "./../../../src/utils"

function trigger() {
    // TODO
}

export default async function handler(req, res) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))

    let validKey = id === TRIGGER_SECRET_KEY
    log("api/trigger was called with validKey", validKey)

    if (validKey) {
        trigger()
        res.status(200).json({ok: true})
    } else
        res.status(404).json({ok: false})
}
