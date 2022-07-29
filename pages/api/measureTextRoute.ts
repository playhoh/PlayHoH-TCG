import {measureText, splitIntoBox} from "../../src/measureText"

export default (req, res) => {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    res.status(200).json({
        width: measureText(id),
        splitIntoBoxArray: splitIntoBox(id)
    })
}
