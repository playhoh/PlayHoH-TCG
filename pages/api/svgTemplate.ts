import {cardTemplateSvg} from "../../src/server/staticData"

export default (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(cardTemplateSvg)
}
