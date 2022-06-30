import fs from "fs"
import path from "path"
import {log} from "../utils"

function getPath(part2: string, file: string) {
    return part2 ? path.resolve('./public', 'static', file, part2) : path.resolve('./public', 'static', file)
}

export function getFileContent(file: string, part2?: string) {
    let pathRes = getPath(part2, file)
    return fs.readFileSync(pathRes, 'utf-8')
}

export function getFileContentBuffer(file: string, part2?: string) {
    let pathRes = getPath(part2, file)
    return fs.readFileSync(pathRes)
}

export const getFileJson = file => {
    const cont = getFileContent(file)
    let res = []
    try {
        res = cont ? JSON.parse(cont) : []
    } catch (e) {
        log("getFileJson for " + file + " failed: " + e)
    }
    return res
}

export const ManInHoodImage = getFileContentBuffer('img', 'Man_in_hood.jpg')

export const objectsTxt = getFileContent('objects.json')
export const effectsTxt = getFileContent('effects.txt')
export const categoriesTxt = getFileContent('categories.txt')

// export const personList = getFileJson('person.json')
export const beta1Txt = getFileContent('beta1.txt')
export const beta2Txt = getFileContent('beta2.txt')

export const badWordList = getFileContent('bad-words.txt')
    .split("\n")
    .map(x => x.trim())
    .filter(x => x.length > 0)

export const cardTemplateSvg = getFileContent('card-template.svg')
    ?.replace(/id="BRAIN"\s+style="/g, "id=\"BRAIN\" style=\"")
    ?.replace(/id="PHYS"\s+style="/g, "id=\"PHYS\" style=\"")
    ?.replace(/fill-opacity:1"\s+id="C/g, "fill-opacity:1\" id=\"C")