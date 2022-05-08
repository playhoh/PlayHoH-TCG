import path from "path"
import fs from "fs"

const dir = x => path.resolve("./public", "static", "gen-art", x)
const dirForGender = (g, x) => path.resolve("./public", "static", "gen-art", g, x)
const maleFiles = fs.readdirSync(dir("male"))
const femaleFiles = fs.readdirSync(dir("female"))
console.log("maleFiles " + maleFiles?.length + ", femaleFiles " + femaleFiles?.length)

export const femaleNames =
    fs.readFileSync(path.resolve("./public", "static", "female.txt"), "utf-8")
        .replace(/\r/g, "")
        .split("\n")
        .map(x => x.trim().toLowerCase())
        .filter(x => x.length > 0 && !x.startsWith("#"))

export function getPathForName(id) {
    const isFemale = femaleNames.includes(id)
    const arr = isFemale ? femaleFiles : maleFiles
    let sum = 0
    for (let i = 0; i < id.length; i++) {
        sum += id.charCodeAt(i) * (i + 1)
    }
    let index = sum % arr.length
    const file = arr[index]
    const path = dirForGender(isFemale ? 'female' : 'male', file)
    return path
}

export const imageMap = {}

export default async function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1).toLowerCase()
    const old = false // TODO caching? imageMap[id]
    if (old) {
        res.end(old)
    } else {
        try {
            if (id === "") {
                res.status(200)
                res.json({})
            } else {
                res.status(200)
                const path = getPathForName(id)
                const fileContents = await fs.readFileSync(path)
                res.end(fileContents)
            }
        } catch (e) {
            console.log(e)
            res.status(404)
            res.json({error: e})
        }
    }
}

