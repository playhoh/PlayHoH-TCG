import {apiUrl, getCatmembersUrl} from "../wikiApi"

async function getWikiParaForName(name) {
    const url = apiUrl(name)
    const json = await fetch(url).then(x => x.json()).catch(x => {
        console.log("ERR: for " + url + ": " + x)
    })
    const k = Object.keys(json.query.pages)[0]
    return json.query.pages[k].extract
}

const fetchJson = (url, thenDo, whenError?: Function) => {
    return fetch(url).then(r => r.json()).then(x => {
        return thenDo(x)
    }).catch(x => {
        let message = "ERR: for " + url + ": " + x
        console.log(message)
        whenError && whenError(message)
    })
}

const waitTime = 1501

export function fetchCat(name, depth, cat, withItem, whenDone) {
    if (depth > 2)
        return Promise.resolve()

    function iter(coll, index, f) {
        if (coll[index]) {
            f(coll[index])

            setTimeout(() => {
                iter(coll, index + 1, f)
            }, waitTime)
        } else if (depth === 0) {
            whenDone()
        }
    }

    return fetchJson(getCatmembersUrl(name), res => {
        iter(res.query.categorymembers, 0, entry => {
            if (entry.title.startsWith("Category:")) {
                withItem("CAT@d" + depth + ": " + entry.title)
                setTimeout(() => {
                    fetchCat(entry.title, depth + 1, entry.title, withItem, whenDone)
                }, waitTime)
                //, res => {
                // + ":\n" + JSON.stringify(res, null, 2))
                //})
            } else {
                getWikiParaForName(entry.title).then(para => {
                    withItem("PAGE@d" + depth + "/" + cat + ": " + entry.title + ", para " + para)
                })
            }
        })
    })
}

export function fetchSingleCat(name, withCat, withItem, whenDone, whenError) {
    function iter(coll, index, f) {
        if (coll[index]) {
            f(coll[index])

            //setTimeout(() => {
            iter(coll, index + 1, f)
            //}, waitTime2)
        } else if (index === coll.length) {
            whenDone()
        }
    }

    return fetchJson(getCatmembersUrl(name), res => {
        iter(res.query.categorymembers, 0, entry => {
            if (entry.title.startsWith("Category:")) {
                withCat(entry.title)
                //, res => {
                // + ":\n" + JSON.stringify(res, null, 2))
                //})
            } else {
                withItem(entry.title)
                /*getWikiParaForName(entry.title).then(para => {
                    withItem(entry.title, para)
                })*/
            }
        })
    }, whenError)
}