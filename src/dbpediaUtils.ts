import {log, toSet} from "./utils"

export async function getVal(obj, dontFetch?: boolean): Promise<string[]> {
    if (typeof obj === "string")
        return [obj]

    const vals = obj[0] ? obj.filter(x =>
        x.lang === 'en' || x.type === 'uri' || x.datatype?.includes('date') || x.datatype?.includes('integer')
    ) : []

    const arr = []
    for (const key in vals) {
        const valueObject = vals[key]
        if (valueObject?.datatype?.includes('date')) {
            const date = new Date(valueObject.value)
            let year = (valueObject.value.startsWith("-") ? "BC " : "") + date.getFullYear()
            let yearFormatted = year + "/" + date.getMonth() + "/" + date.getDate()
            arr.push(yearFormatted)
        } else if (valueObject?.datatype?.includes('integer')) {
            const date = parseInt(valueObject.value)
            let yearFormatted = (valueObject.value?.toString()?.startsWith("-") ? "BC " : "") + date
            arr.push(yearFormatted)
        } else {
            let value = valueObject?.value || ""
            if (valueObject?.type === 'uri') {
                let lowerCase = value.toLowerCase()
                if (lowerCase.includes("jpg") || lowerCase.includes("png") || lowerCase.includes("svg"))
                    arr.push(value)
                else if (value.includes("PersonFunction")) {
                    const url = value.replace("/resource/", "/data/") + ".json"
                    try {
                        if (dontFetch) {
                            arr.push(value)
                        } else {
                            let obj1 = await fetch(url).then(x => x.json())
                            let newVar = await getVal(obj1)
                            arr.push(...newVar)
                        }
                    } catch (e) {
                        log("error for " + url + ": " + e)
                    }
                } else {
                    let valueReplaced = value.replace("http://dbpedia.org/resource/", "")
                        .replace(/_/g, " ")
                    arr.push(valueReplaced)
                }
            } else {
                arr.push(value)
            }
        }
    }
    return arr
}

export async function getAllInObj(json, id, dontFetch?: boolean) {
    const res = []

    async function iter(x) {
        for (const key in x) {
            const obj = x[key]
            let v = []
            if (key.includes("" + id) && (v = await getVal(obj, dontFetch))) {
                res.push(...v)
            }
            if (typeof obj === "object") {
                await iter(obj)
            }
        }
    }

    await iter(json)
//        console.log("found ", res)
    // if (res.length === 1)
    return toSet(res)
    //if (throws)
    //  throw new Error("Ambiguous id " + id + ": " + res.join(", "))
    //else
    //  return ""
}