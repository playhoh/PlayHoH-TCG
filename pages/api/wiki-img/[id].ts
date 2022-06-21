import fs from "fs"
import {getImageForName} from "../../../src/server/cardLookup"
import {personList} from "../../../src/server/staticData"

async function fetchImages(i) {
    const p = personList[i]
    if (p) {
        const name = p.names
        await getImageForName(name)
    }
}

async function downloadAndSaveImg(name, url) {
    console.log("url: " + url)
    const res = await fetch(url).then(x => x.arrayBuffer()).then(x => Buffer.from(x))
    const path = "C:/Projects/HeroesOfHistoryTCG/public/static/img/" + name + ".jpg"
    fs.createWriteStream(path).write(res)
}

function iter(i, res) {
    if (i < personList.length) {
        const p = personList[i]
        if (p) {
            const n = p.names.split(' ')[1] ?? p.names.split(' ')[0]
            if (p.img) {
                iter(i + 1, res)
            } else {
                getImageForName(n).then(img => {
                    p.img = img
                    if (p.img !== "") {
                        downloadAndSaveImg(n, img)
                    }
                    setTimeout(() => {
                        try {
                            iter(i + 1, res)
                        } catch {
                        }
                    }, 100)
                }).catch(() => iter(i + 1, res))
            }
        }
    } else {
        res.send(personList)
    }
}

export default async (req, res) => {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    if (id === "fetchallwikiimagesagainyes") {
        iter(0, res)
    } else {
        const img = await getImageForName(id)
        res.send(img)
    }
}
