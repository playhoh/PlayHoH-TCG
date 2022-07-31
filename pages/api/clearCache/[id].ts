import {imageMap} from "../face/[id]"
import {svgMap} from "../img/[id]"
import {TRIGGER_SECRET_KEY} from "../../../components/constants"

export default (req, res) => {
    console.log("clearCache")
    const id = req?.url?.substring(req?.url.lastIndexOf("/") + 1)
    let sum = 0
    if (id === TRIGGER_SECRET_KEY()) {
        for (const key in svgMap) {
            sum += svgMap[key] ? 1 : 0
            svgMap[key] = undefined
        }

        for (const key in imageMap) {
            sum += imageMap[key] ? 1 : 0
            imageMap[key] = undefined
        }
        res.status(200).json({cleared: sum})
    } else {
        // res.status(404)
        res.status(200).json({notCleared: ""})
    }
}
