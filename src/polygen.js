const tempSeed = () => new Date().getTime().toString(36)

function xmur3(str) {
    let h
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
        h = h << 13 | h >>> 19
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507)
        h = Math.imul(h ^ (h >>> 13), 3266489909)
        h ^= h >>> 16
        return h >>> 0
    }
}

function randomGenTime() {
    return xmur3(tempSeed())
}

function randomGen(x) {
    return xmur3(x)
}

function capitalize(x) {
    if (!x)
        return ""
    return x.charAt(0).toUpperCase() + (x.length > 1 ? x.substring(1) : x)
}

function runGrammar(b, s) {
    let newVar = typeof b
    //console.log(newVar, " is type of ", b)
    if (newVar === "string")
        return b
    else if (newVar === "function")
        return runGrammar(b(), s)
    else if (newVar === "object" && b.length >= 2) {
        const first = b[0]
        if (first === "s") {
            return b.slice(1).filter(x => x).map(x => runGrammar(x, s)).join("")
        } else if (first === "u") {
            return capitalize(runGrammar(b[1], s))
        } else if (first === "c") {
            let x1 = s()
            b = b.filter((x, i) => i > 0 && x)
            let number = Math.abs(x1) % b.length
            const el = b[number]
            return runGrammar(el, s)
        } else
            throw new Error("Not a valid array operator, must be _c_hoice, _s_equence, or _u_ppercase, was " + first)
    } else
        throw new Error("Not a valid type, must be string, number, function or array (at least 2 items), was " + newVar
            + ", object " + JSON.stringify(b))
}

module.exports = {runGrammar, randomGen, randomGenTime}