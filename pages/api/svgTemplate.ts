import fs from 'fs'
import path from 'path'

const svgPath = path.resolve('./public', 'static', 'card-template.svg');

export const cardTemplateSvg =
    fs.readFileSync(svgPath, 'utf-8')
        ?.replace(/id="BRAIN"\s+style="/g, "id=\"BRAIN\" style=\"")
        ?.replace(/id="PHYS"\s+style="/g, "id=\"PHYS\" style=\"")
        ?.replace(/fill-opacity:1"\s+id="C/g, "fill-opacity:1\" id=\"C")

export default (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(cardTemplateSvg)
}
