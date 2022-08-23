import {measureText, splitIntoBox} from "../../src/measureText"
import {NextApiRequest, NextApiResponse} from "next"
import {cardTextBoxWidthSVG, cardTextFontSizeSVG} from "../../src/utils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    res.status(200).json({
        width: measureText(id),
        splitIntoBoxArray: splitIntoBox(id, cardTextFontSizeSVG, cardTextBoxWidthSVG)
    })
}
