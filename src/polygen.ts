import {capitalize, tempSeed, xmur3} from "./utils"

export function randomGenTime() {
    return xmur3(tempSeed())
}

export function randomGen(x) {
    return xmur3(x)
}

export function runGrammar(obj, rndFunc) {
    let newVar = typeof obj
    //console.log(newVar, " is type of ", obj)
    if (newVar === "string")
        return obj
    else if (newVar === "function")
        return runGrammar(obj(), rndFunc)
    else if (newVar === "object" && obj.length >= 2) {
        const first = obj[0]
        if (first === "s") {
            return obj.slice(1).filter(x => x).map(x => runGrammar(x, rndFunc)).join("")
        } else if (first === "u") {
            return capitalize(runGrammar(obj[1], rndFunc))
        } else if (first === "c") {
            let x1 = rndFunc()
            obj = obj.filter((x, i) => i > 0 && x)
            let number = Math.abs(x1) % obj.length
            const el = obj[number]
            return runGrammar(el, rndFunc)
        } else
            throw new Error("Not a valid array operator, must be _c_hoice, _s_equence, or _u_ppercase, was " + first)
    } else
        throw new Error("Not a valid type, must be string, number, function or array (at least 2 items), was " + newVar
            + ", object " + JSON.stringify(obj))
}
