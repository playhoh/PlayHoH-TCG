import {svgCache} from "../svg/[id]"
import {imageMap} from "../face/[id]"

export default (req, res) => {
    console.log("clearCache")
    const id = req?.url?.substring(req?.url.lastIndexOf("/") + 1)
    let sum = 0
    if (id === "iknowwhatiamdoingkarsten") {
        for (const key in svgCache) {
            sum += imageMap[key] ? 1 : 0
            svgCache[key] = undefined
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
